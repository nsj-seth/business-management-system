# Farms module — integration with existing Supabase tables

Your Supabase project already contains `public.farm_opening_state` and `public.farm_transactions`.
**Do not recreate, delete, or truncate these tables.**

The existing `farm_transactions` columns are `type` (`credit` or `debit`), `amount`, and `balance`. They do **not** contain separate `credit` and `debit` columns. The backend derives those values when formatting API responses; existing rows are compatible.

## Required database preparation

1. Back up `farm_transactions` and `farm_opening_state`.
2. Run `database/farms.sql` in the Supabase SQL Editor. This creates indexes and the atomic `add_farm_transaction` function, but does **not** recreate or delete either table.
3. Confirm your existing opening state and all existing transactions are correct before adding an entry. **The first new transaction recalculates the balance of every existing farm transaction** according to transaction date (then creation time and ID). This may change stored historical balances if earlier balances were based on entry order.
4. Ensure the authenticated user's ID exists in `public.profiles`: existing `created_by` foreign keys reference profiles, not auth.users directly.

The existing opening state is reused automatically. The UI's suggested opening date and amount are shown only if no opening state exists.

The Farms ledger displays newest *entered* records first (by `created_at`). Balance calculations follow *transaction date* so backdated entries adjust later balances.

**Deployment:** The SQL Editor step is not run automatically when code is committed to GitHub.
