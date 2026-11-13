const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

const installation = readFileSync(resolve(__dirname, '../../database/farms.sql'), 'utf8');
const user = '11111111-1111-1111-1111-111111111111';
async function fixture() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create table public.profiles (id uuid primary key);
    insert into public.profiles values ('${user}');
    create table public.farm_opening_state (
      id uuid primary key default gen_random_uuid(), as_of_date date not null,
      opening_balance numeric not null default 0, created_at timestamptz not null default now(),
      created_by uuid references public.profiles(id));
    create table public.farm_transactions (
      id uuid primary key default gen_random_uuid(), reference_number text not null unique,
      date date not null, particular text not null,
      type text not null check (type in ('credit','debit')),
      amount numeric not null check (amount >= 0), balance numeric not null,
      created_at timestamptz not null default now(), created_by uuid references public.profiles(id));
  `);
  return db;
}
const opening = (db, amount = 100) => db.query(
  'insert into farm_opening_state (as_of_date,opening_balance) values ($1,$2)', ['2026-09-01',amount]);
const add = (db, date, type, amount, description = 'Test entry', actor = user) => db.query(
  'select * from public.add_farm_transaction($1,$2,$3,$4,$5)', [date,description,type,amount,actor]);
const summary = async db => (await db.query('select public.get_farm_summary() as s')).rows[0].s;

test('reconciles legacy balances immediately, preserves source records and is repeatable', async () => {
  const db = await fixture();
  try {
    await opening(db, 19714);
    await db.exec(`insert into farm_transactions(reference_number,date,particular,type,amount,balance)
      values ('legacy','2026-09-16','Legacy debit','debit',16500,-526);`);
    const before = (await db.query('select id,reference_number,date,particular,type,amount,created_at,created_by from farm_transactions')).rows;
    await db.exec(installation);
    assert.equal((await summary(db)).currentBalance, 3214);
    assert.deepEqual((await db.query('select id,reference_number,date,particular,type,amount,created_at,created_by from farm_transactions')).rows, before);
    await db.exec(installation);
    assert.equal((await summary(db)).transactionCount, 1);
    assert.equal((await db.query('select recalculate_farm_balances() as n')).rows[0].n, 0);
  } finally { await db.close(); }
});

test('backdated credits recalculate later debit balances with exact decimal arithmetic', async () => {
  const db = await fixture();
  try {
    await opening(db); await db.exec(installation);
    await add(db,'2026-09-03','debit',20.25);
    await add(db,'2026-09-02','credit',10.10);
    assert.deepEqual((await db.query('select balance from farm_transactions order by date')).rows.map(x=>Number(x.balance)), [110.10,89.85]);
    assert.deepEqual(await summary(db), {currentBalance:89.85,totalCredit:10.1,totalDebit:20.25,transactionCount:2});
    await add(db,'2026-09-03','credit',0);
    assert.equal((await summary(db)).currentBalance,89.85);
    assert.equal((await summary(db)).transactionCount,3);
  } finally { await db.close(); }
});

test('invalid input cannot leave a partial entry or change balances', async () => {
  const db = await fixture();
  try {
    await opening(db); await db.exec(installation);
    for (const args of [
      ['2026-08-31','credit',10], ['2026-09-02','sale',10],
      ['2026-09-02','credit',-1], ['2026-09-02','credit',0.001],
      ['2026-09-02','credit','NaN'], ['2026-09-02','credit','Infinity'],
      ['2026-09-02','credit',10,'   '],
      ['2026-09-02','credit',10,'Test','22222222-2222-2222-2222-222222222222'],
    ]) await assert.rejects(add(db,...args));
    assert.equal((await summary(db)).transactionCount,0);
    assert.equal((await summary(db)).currentBalance,100);
  } finally { await db.close(); }
});

test('singleton opening guard rejects duplicates and refuses ambiguous legacy setup', async () => {
  const db = await fixture();
  try {
    await opening(db); await db.exec(installation);
    await assert.rejects(opening(db));
    assert.equal((await db.query('select count(*) from farm_opening_state')).rows[0].count,1);
    await db.exec('drop index idx_farm_opening_state_singleton');
    await opening(db);
    await assert.rejects(db.exec(installation), /Multiple Farms opening rows/);
    await db.exec('rollback');
    assert.equal((await db.query('select count(*) from farm_opening_state')).rows[0].count,2);
  } finally { await db.close(); }
});

test('summary includes more than 1000 transactions and RPCs deny browser roles', async () => {
  const db = await fixture();
  try {
    await opening(db); await db.exec(installation);
    await db.exec(`insert into farm_transactions(reference_number,date,particular,type,amount,balance)
      select 'test-' || i, '2026-09-02', 'Bulk test', 'credit', 1, 0 from generate_series(1,1005) i;
      select recalculate_farm_balances();`);
    assert.deepEqual(await summary(db), {currentBalance:1105,totalCredit:1005,totalDebit:0,transactionCount:1005});
    for (const role of ['anon','authenticated']) {
      for (const fn of ['public.get_farm_summary()', 'public.recalculate_farm_balances()', 'public.add_farm_transaction(date,text,text,numeric,uuid)']) {
        const q=await db.query('select has_function_privilege($1,$2,$3) as allowed',[role,fn,'execute']);
        assert.equal(q.rows[0].allowed,false);
      }
    }
  } finally { await db.close(); }
});

test('missing opening state is handled without inventing balances', async () => {
  const db = await fixture();
  try {
    await db.exec(installation);
    assert.deepEqual(await summary(db),{currentBalance:0,totalCredit:0,totalDebit:0,transactionCount:0});
    await assert.rejects(add(db,'2026-09-02','credit',10), /opening balance/);
  } finally { await db.close(); }
});

test('the 41 approved historical amounts reconcile to 23178 without editing source values', async () => {
  const db = await fixture();
  const amounts = [2507,2600,-1630,780,1600,-120,1740,1540,2970,4455,-1410,2570,2500,-1230,1980,160,2650,2490,-1480,2550,2500,-1130,-32080,600,-16500,2257,2000,2303,2074,-1810,540,2280,2480,-370,180,2520,2380,2250,-320,240,960];
  const days = [1,2,2,2,2,2,3,4,5,6,6,7,8,8,10,10,9,10,10,11,12,12,15,14,16,13,14,15,16,16,16,17,18,18,18,19,20,21,21,21,21];
  try {
    await opening(db,22602);
    for (let i=0;i<amounts.length;i++) {
      await db.query(`insert into farm_transactions(reference_number,date,particular,type,amount,balance,created_at)
        values ($1,$2,'Historical regression',$3,$4,0,$5)`,
        ['fixture-'+i,`2026-09-${String(days[i]).padStart(2,'0')}`, amounts[i]<0?'debit':'credit',Math.abs(amounts[i]),new Date(Date.UTC(2026,8,29,12,0,i)).toISOString()]);
    }
    await db.exec(installation);
    const totals=await summary(db);
    assert.equal(totals.transactionCount,41);
    assert.equal(totals.currentBalance,23178);
    assert.equal(totals.currentBalance,22602+totals.totalCredit-totals.totalDebit);
    const after=(await db.query('select type,amount from farm_transactions order by created_at')).rows;
    assert.deepEqual(after.map(x=>(x.type==='credit'?1:-1)*Number(x.amount)),amounts);
  } finally { await db.close(); }
});
