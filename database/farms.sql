-- Run this entire file in the BMS Supabase SQL Editor.
-- Reuses existing tables. Changes stored BALANCES only, never amounts or descriptions.
-- Installation and reconciliation either commit together or roll back together.
begin;
select pg_advisory_xact_lock(2468101214);
lock table public.farm_opening_state, public.farm_transactions in share row exclusive mode;

do $$
begin
  if (select count(*) from public.farm_opening_state) > 1 then
    raise exception 'Multiple Farms opening rows exist; reconcile opening setup first';
  end if;
  if exists (select 1 from public.farm_transactions)
     and not exists (select 1 from public.farm_opening_state) then
    raise exception 'Farm opening balance must be set up first';
  end if;
  if exists (
    select 1 from public.farm_transactions t cross join public.farm_opening_state o
    where t.date < o.as_of_date
  ) then
    raise exception 'Existing transaction date precedes the farm opening date';
  end if;
end;
$$;

-- A database invariant also protects two simultaneous opening-setup requests.
create unique index if not exists idx_farm_opening_state_singleton
  on public.farm_opening_state ((true));
create index if not exists idx_farm_transactions_ledger_order
  on public.farm_transactions (date, created_at, id);
create index if not exists idx_farm_transactions_entry_order
  on public.farm_transactions (created_at desc, id desc);

create or replace function public.recalculate_farm_balances()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_opening public.farm_opening_state;
  v_updated integer;
begin
  perform pg_advisory_xact_lock(2468101214);
  lock table public.farm_opening_state in share mode;
  lock table public.farm_transactions in share row exclusive mode;
  select * into v_opening from public.farm_opening_state;
  if not found then
    if exists (select 1 from public.farm_transactions) then
      raise exception 'Farm opening balance must be set up first';
    end if;
    return 0;
  end if;
  if exists (select 1 from public.farm_transactions where date < v_opening.as_of_date) then
    raise exception 'Transaction date cannot precede the farm opening date';
  end if;

  with ledger as (
    select id, v_opening.opening_balance + sum(
      case when type = 'credit' then amount else -amount end
    ) over (order by date, created_at, id rows between unbounded preceding and current row) as balance
    from public.farm_transactions
  )
  update public.farm_transactions t set balance = ledger.balance
  from ledger where t.id = ledger.id and t.balance is distinct from ledger.balance;
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

create or replace function public.add_farm_transaction(
  p_date date, p_particular text, p_type text, p_amount numeric, p_user_id uuid
)
returns public.farm_transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_opening public.farm_opening_state;
  v_created public.farm_transactions;
begin
  -- Serialize insertion AND recalculation, including simultaneous/backdated requests.
  perform pg_advisory_xact_lock(2468101214);
  lock table public.farm_opening_state in share mode;
  lock table public.farm_transactions in share row exclusive mode;

  if p_date is null or p_particular is null or length(trim(p_particular)) = 0
     or p_type is null or p_type not in ('credit', 'debit')
     or p_amount is null or p_amount::text in ('NaN', 'Infinity', '-Infinity')
     or p_amount < 0 or p_amount > 999999999999.99
     or p_amount <> round(p_amount, 2) then
    raise exception 'Invalid farm transaction input' using errcode = '22023';
  end if;
  if p_user_id is null or not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'A matching user profile is required for Farms entries' using errcode = '22023';
  end if;
  select * into v_opening from public.farm_opening_state;
  if not found then
    raise exception 'Farm opening balance must be set up first' using errcode = '22023';
  end if;
  if p_date < v_opening.as_of_date then
    raise exception 'Transaction date cannot precede the farm opening date' using errcode = '22023';
  end if;

  insert into public.farm_transactions (
    reference_number, date, particular, type, amount, balance, created_by
  ) values (
    'FRM-' || replace(gen_random_uuid()::text, '-', ''),
    p_date, trim(p_particular), p_type, p_amount, 0, p_user_id
  ) returning * into v_created;

  perform public.recalculate_farm_balances();
  select * into v_created from public.farm_transactions where id = v_created.id;
  return v_created;
end;
$$;

-- Totals and current balance come from one database snapshot, without API row limits.
create or replace function public.get_farm_summary()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'currentBalance', coalesce(
      (select balance from public.farm_transactions order by date desc, created_at desc, id desc limit 1),
      (select opening_balance from public.farm_opening_state), 0),
    'totalCredit', coalesce(sum(amount) filter (where type = 'credit'), 0),
    'totalDebit', coalesce(sum(amount) filter (where type = 'debit'), 0),
    'transactionCount', count(*)
  ) from public.farm_transactions;
$$;

-- Browser roles cannot call these privileged backend operations.
revoke all on function public.recalculate_farm_balances() from public, anon, authenticated;
revoke all on function public.add_farm_transaction(date, text, text, numeric, uuid) from public, anon, authenticated;
revoke all on function public.get_farm_summary() from public, anon, authenticated;
grant execute on function public.recalculate_farm_balances() to service_role;
grant execute on function public.add_farm_transaction(date, text, text, numeric, uuid) to service_role;
grant execute on function public.get_farm_summary() to service_role;

-- Reconcile NOW rather than silently waiting until the first new entry.
select public.recalculate_farm_balances() as balances_reconciled;
notify pgrst, 'reload schema';
commit;

-- Final result shown by SQL Editor after commit.
select public.get_farm_summary() as farms_summary;
