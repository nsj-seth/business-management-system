-- ============================================================
-- CORE SCHEMA
-- ============================================================

-- profiles: extends Supabase's built-in auth.users with our
-- own business fields (role). One row per authenticated user.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- audit_logs: a record of significant actions taken in the system.
-- record_id has no FK constraint because it can point to a row
-- in any module's tables (module + record_id together identify it).
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  module text not null,
  record_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BAKERY SCHEMA
-- ============================================================

-- bakery_days: one row per business day. Sales/expenses attach to this.
create table bakery_days (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  date date not null unique,
  opening_balance numeric(12, 2) not null,
  total_sales numeric(12, 2) not null default 0,
  total_expenses numeric(12, 2) not null default 0,
  closing_balance numeric(12, 2) not null,
  status text not null default 'open' check (status in ('open', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- bakery_sales: dynamic sales rows for a given day.
-- UNIQUE(day_id, salesperson) enforces "no duplicate salesperson per day"
-- at the database level, not just in application code.
create table bakery_sales (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references bakery_days(id) on delete cascade,
  salesperson text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (day_id, salesperson)
);

-- bakery_expenses: dynamic expense rows for a given day.
create table bakery_expenses (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references bakery_days(id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RESERVES SCHEMA
-- ============================================================

-- reserve_opening_state: the one-time migration snapshot from the
-- existing paper ledger. Application logic (not a DB constraint)
-- ensures only one row is ever created.
create table reserve_opening_state (
  id uuid primary key default gen_random_uuid(),
  as_of_date date not null,
  opening_cumulative_profit numeric(12, 2) not null,
  opening_cumulative_expense numeric(12, 2) not null,
  opening_balance numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

-- reserve_transactions: individual profit/expense entries.
-- Each row freezes its own cumulative totals and balance at that
-- point in time, mirroring how the paper ledger works.
create table reserve_transactions (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  date date not null,
  particular text not null,
  type text not null check (type in ('profit', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  cumulative_profit numeric(12, 2) not null,
  cumulative_expense numeric(12, 2) not null,
  balance numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

-- ============================================================
-- INDEXES
-- ============================================================
-- Speed up the queries we'll run constantly: "find sales/expenses
-- for a day" and "find the most recent transaction."
create index idx_bakery_sales_day_id on bakery_sales(day_id);
create index idx_bakery_expenses_day_id on bakery_expenses(day_id);
create index idx_reserve_transactions_date on reserve_transactions(date);


-- ============================================================
-- ROW LEVEL SECURITY
-- Enabled on every table with no policies yet. This means only
-- the service_role key (used by our Express backend) can access
-- these tables for now. Real policies for anon/authenticated
-- access come later, once Supabase Auth is wired up (Phase 27+).
-- ============================================================
alter table profiles enable row level security;
alter table audit_logs enable row level security;
alter table bakery_days enable row level security;
alter table bakery_sales enable row level security;
alter table bakery_expenses enable row level security;
alter table reserve_opening_state enable row level security;
alter table reserve_transactions enable row level security;