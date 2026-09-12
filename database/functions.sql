-- Completes a bakery day: recalculates final totals from its sales
-- and expenses, then locks it by setting status and completed_at.
-- Runs as a single atomic transaction -- either all of this happens,
-- or none of it does.
create or replace function complete_bakery_day(p_day_id uuid)
returns bakery_days
language plpgsql
as $$
declare
  v_day bakery_days;
  v_total_sales numeric(12, 2);
  v_total_expenses numeric(12, 2);
  v_closing_balance numeric(12, 2);
begin
  -- Lock the row for the duration of this transaction, so two
  -- simultaneous "complete" requests for the same day can't race
  -- each other.
  select * into v_day from bakery_days where id = p_day_id for update;

  if v_day is null then
    raise exception 'Day not found';
  end if;

  if v_day.status = 'completed' then
    raise exception 'Day is already completed';
  end if;

  select coalesce(sum(amount), 0) into v_total_sales
  from bakery_sales where day_id = p_day_id;

  select coalesce(sum(amount), 0) into v_total_expenses
  from bakery_expenses where day_id = p_day_id;

  v_closing_balance := v_day.opening_balance + v_total_sales - v_total_expenses;

  update bakery_days
  set
    total_sales = v_total_sales,
    total_expenses = v_total_expenses,
    closing_balance = v_closing_balance,
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where id = p_day_id
  returning * into v_day;

  return v_day;
end;
$$;