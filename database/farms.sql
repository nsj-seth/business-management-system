-- Run this migration in the Supabase SQL Editor before using the Farms module.
-- Ledger order: transaction date, creation timestamp, ID. Display order: newest entry first.
create table if not exists public.farm_opening_state (
  id uuid primary key default gen_random_uuid(),
  as_of_date date not null,
  opening_balance numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Only one opening balance may exist, even if two requests arrive simultaneously.
create unique index if not exists farm_opening_state_singleton
on public.farm_opening_state ((true));

create table if not exists public.farm_transactions (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  date date not null,
  particular text not null check (length(trim(particular)) > 0),
  type text not null check (type in ('credit', 'debit')),
  amount numeric(14, 2) not null check (amount >= 0),
  credit numeric(14, 2) not null default 0,
  debit numeric(14, 2) not null default 0,
  balance numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_farm_transactions_ledger_order
on public.farm_transactions (date, created_at, id);

create index if not exists idx_farm_transactions_entry_order
on public.farm_transactions (created_at desc, id desc);

alter table public.farm_opening_state enable row level security;
alter table public.farm_transactions enable row level security;

-- The Express server calls this through its service-role Supabase client.
-- A transaction-scoped advisory lock serializes farm inserts and recalculations.
-- When an older dated entry is inserted, all later ledger balances are recomputed.
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
  v_running_balance numeric(14, 2);
begin
  perform pg_advisory_xact_lock(2468101214);

  if p_date is null or p_particular is null or length(trim(p_particular)) = 0
     or p_type not in ('credit', 'debit') or p_type is null
     or p_amount is null or p_amount < 0 or p_amount > 999999999999.99 then
    raise exception 'Invalid farm transaction input';
  end if;

  select * into v_opening from public.farm_opening_state limit 1;
  if not found then
    raise exception 'Farm opening balance must be set up first';
  end if;

  if p_date < v_opening.as_of_date then
    raise exception 'Transaction date cannot precede the farm opening date';
  end if;

  insert into public.farm_transactions (
    reference_number, date, particular, type, amount, credit, debit,
    balance, created_by
  ) values (
    'FRM-' || replace(gen_random_uuid()::text, '-', ''),
    p_date, trim(p_particular), p_type, p_amount,
    case when p_type = 'credit' then p_amount else 0 end,
    case when p_type = 'debit' then p_amount else 0 end,
    0, p_user_id
  ) returning * into v_created;

  v_running_balance := v_opening.opening_balance;
  for v_row in
    select id, credit, debit from public.farm_transactions
    order by date asc, created_at asc, id asc
  loop
    v_running_balance := v_running_balance + v_row.credit - v_row.debit;
    update public.farm_transactions
    set balance = v_running_balance
    where id = v_row.id;
  end loop;

  select * into v_created from public.farm_transactions where id = v_created.id;
  return v_created;
end;
$$;

-- No public execute permission: only the backend service role may call it.
revoke all on function public.add_farm_transaction(date, text, text, numeric, uuid)
from public, anon, authenticated;
grant execute on function public.add_farm_transaction(date, text, text, numeric, uuid)
to service_role;
