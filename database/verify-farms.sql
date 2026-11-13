-- Read-only check after applying database/farms.sql.
with opening as (
  select opening_balance from public.farm_opening_state order by created_at, id limit 1
), ledger as (
  select t.balance, o.opening_balance + sum(
    case when t.type = 'credit' then t.amount else -t.amount end
  ) over (order by t.date, t.created_at, t.id rows between unbounded preceding and current row) as expected_balance
  from public.farm_transactions t cross join opening o
)
select
  (select count(*) from public.farm_opening_state) as opening_rows,
  (select count(*) from public.farm_transactions) as transaction_rows,
  (select count(*) from ledger where balance is distinct from expected_balance) as mismatched_balances,
  public.get_farm_summary() as summary;
