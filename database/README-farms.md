# Farms ledger repair and installation

This repair uses the existing `farm_opening_state` and `farm_transactions` tables. It does not recreate tables, delete transactions, or modify transaction amounts, types, descriptions, dates, references, or authors. It updates stored running balances in `(date, created_at, id)` order, which supports backdated transactions consistently.

## Apply in this order

1. Open `database/farms.sql` from the `fix/farms-ledger-integrity` branch and run the **entire file** in the **BMS** project's Supabase SQL Editor, as the project database administrator. Do not run it in the student-marketplace project. It installs backend functions, adds indexes, and immediately reconciles existing balances in one transaction. Installation refuses multiple opening rows, transactions without an opening row, or transactions dated before the opening date. It does not choose or delete conflicting records.
2. Run `database/verify-farms.sql`. For the user-supplied 41 records and opening balance of 22,602, expect `opening_rows = 1`, `transaction_rows = 41`, `mismatched_balances = 0`, and `summary.currentBalance = 23178`. If records have changed since that snapshot, the count and total may differ; verify against the changed records before continuing.
3. Pull the feature branch for local testing. Run `npm.cmd ci` and `npm.cmd test` in `server`; start the backend with `npm.cmd start`. Run `npm.cmd ci` and `npm.cmd run dev` in `client`. Keep your existing environment files. The frontend's API URL must point to the local backend when testing it. A Vercel frontend preview alone does not deploy the Express backend from this branch.
4. Use disposable test data in a separate test database to test a credit, debit, zero entry and backdated entry. Check subsequent balances against opening + credits - debits. Do not add throwaway financial entries to production: no delete workflow exists.
5. After review, merge the PR and verify that both the API host and Vercel deploy the new code. SQL Editor changes are not applied automatically by GitHub, Vercel, or Render.

The first two steps change live balance values as explicitly approved. They are not a read-only preview. Re-running the SQL is safe for an already valid ledger; only balances that differ are updated. Future inserts and all affected balance updates commit or fail together. An advisory transaction lock and table locks serialize writes. A unique constant-expression index prevents two opening rows even if two API requests pass the pre-check simultaneously.

## API and UI behavior

- Existing `type` + `amount` columns remain the source of credit/debit presentation.
- Summary values are computed server-side in one database snapshot, not by summing a capped PostgREST result. Transaction listing walks response pages so old entries beyond 1,000 rows remain available.
- Missing RPC installation returns an actionable 503; missing profile foreign-key failures return an actionable conflict. `created_by` must match `profiles.id`.
- Existing entries are displayed newest **entered** first; running balances follow transaction date, then creation timestamp and UUID. A recently entered backdated row therefore need not have the current overall balance. The summary card uses the chronologically last balance.
- Zero-amount entries display `0.00` on the correct credit/debit side. Reference numbers and opening context are visible, and failed summary loads do not display fabricated zero totals or permit submission.
- SQL functions use invoker privileges and an empty search path; only the backend service role is granted execution. No browser service-role key is needed.

## Validation and boundaries

`cd server` then `npm test` runs SQL integration tests in disposable embedded PostgreSQL (PGlite), with no production credentials. It covers source-value preservation, rerunning installation, backdated balances, decimals, invalid values, singleton enforcement, missing opening state, >1,000-entry totals, RPC grants, and the supplied 41-entry amounts. Service tests cover actionable setup errors and opening conflicts.

PGlite serializes connections, so these tests do not simulate two real concurrent network connections. The locking strategy requires a two-connection staging test before claiming concurrent-load validation. Production browser flows require user verification.

This PR deliberately does not change Bakery, Reserves or Cement. It does not infer whether historical source amounts/descriptions are correct, introduce edit/delete endpoints, decide new admin/manager/staff permissions, add an audit subsystem, change existing RLS policies or grants on tables, or resolve dependency audit findings. Those require separate review. Existing API writes remain available to signed-in users as before; database function execution is service-role-only, but existing table-level Data API permissions still need inspection.
