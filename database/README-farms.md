# Farms database setup

Run `database/farms.sql` in the **Supabase SQL Editor** of the database connected to the BMS backend **before** opening the new Farms page. This is a one-time schema migration; committing it to GitHub does not execute it.

The Farms UI suggests a starting date of 2026-09-01 and opening balance of 22,602.00. Verify these against the paper ledger before saving. The opening balance is saved only once.

Entries contain a date, free-text particular, type (credit or debit) and amount. The Postgres function `add_farm_transaction` inserts each entry and recalculates all running balances in chronological transaction-date order within one database transaction. The ledger page lists entries by time entered (newest first), so a backdated entry may appear ahead of transactions whose ledger balances it affects.

Farms endpoints require Supabase authentication. The function only grants execution to the server-side service role, and the two tables use RLS with no browser policies.

The migration must be applied to the live database separately; it will not run automatically on deploy.
