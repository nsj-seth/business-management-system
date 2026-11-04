-- Compatibility migration for the EXISTING public.farm_* tables.
-- Do NOT drop or recreate either table. Existing farm records stay intact.
-- Run in Supabase SQL Editor once, after backing up existing transaction data.
-- Existing table fields: type ('credit'|'debit'), amount, balance;
-- there are NO separate credit or debit columns.
create index if not exists idx_farm_transactions_ledger_order
  on public.farm_transactions (date, created_at, id);
create index if not exists idx_farm_transactions_entry_order
  on public.farm_transactions (created_at desc, id desc);

-- Inserts a farm transaction and recalculates running balances by transaction date.
-- PostgreSQL commits the insert and balance updates atomically.
-- NOTE: Existing balances are recalculated when the NEXT transaction is added;
-- run a reconciliation separately first if existing ledger figures are uncertain.
create or replace function public.add_farm_transaction(
  p_date date,
  p_particular text,
  p_type text,
  p_amount numeric,
  p_user_id uuid
)
returns public.farm_transactions
language plpgsql
set search_path = public
as $$
declare
  v_opening public.farm_opening_state;
  v_created public.farm_transactions;
  v_row record;
  v_running_balance numeric;
begin
  perform pg_advisory_xact_lock(2468101214);

  if p_date is null or p_particular is null or length(trim(p_particular)) = 0
     or p_type is null or p_type not in ('credit', 'debit')
     or p_amount is null or p_amount < 0
     or p_amount > 999999999999.99 then
    raise exception 'Invalid farm transaction input';
  end if;

  select * into v_opening from public.farm_opening_state
    order by created_at, id limit 1;
  if not found then
    raise exception 'Farm opening balance must be set up first';
  end if;
  if p_date < v_opening.as_of_date then
    raise exception 'Transaction date cannot precede the farm opening date';
  end if;

  insert into public.farm_transactions (
    reference_number, date, particular, type, amount, balance, created_by
  ) values (
    'FRM-' || replace(gen_random_uuid()::text, '-', ''),
    p_date, trim(p_particular), p_type, p_amount, 0, p_user_id
  ) returning * into v_created;

  v_running_balance := v_opening.opening_balance;
  for v_row in
    select id, type, amount
      from public.farm_transactions
      order by date asc, created_at asc, id asc
  loop
    v_running_balance := v_running_balance +
      case when v_row.type = 'credit' then v_row.amount else -v_row.amount end;
    update public.farm_transactions
      set balance = v_running_balance
      where id = v_row.id;
  end loop;

  select * into v_created from public.farm_transactions where id = v_created.id;
  return v_created;
end;
$$;

-- Only the backend's service role should execute this function.
revoke all on function public.add_farm_transaction(date, text, text, numeric, uuid)
  from public, anon, authenticated;
grant execute on function public.add_farm_transaction(date, text, text, numeric, uuid)
  to service_role;
