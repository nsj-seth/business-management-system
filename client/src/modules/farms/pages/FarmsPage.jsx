import { useCallback, useEffect, useState } from 'react';
import { farmsApi } from '../services/farmsApi';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, Th, Td } from '../../../components/ui/Table';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';

const PAGE_SIZE = 20;
const money = (value) => Number(value ?? 0).toLocaleString('en-GH', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const inputClass = 'bg-panel-bg border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent';

function OpeningSetup({ onComplete }) {
  const [asOfDate, setAsOfDate] = useState('2026-09-01');
  const [balance, setBalance] = useState('22602');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await farmsApi.setupOpeningState(asOfDate, Number(balance));
      await onComplete();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-text-muted">
        Enter the opening balance from your paper Farms ledger. This is a one-time setup.
        The suggested figures can be changed before saving.
      </p>
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-text-muted">
            Opening date
            <input className={inputClass + ' mt-1 w-full'} type="date"
              required value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          </label>
          <label className="block text-sm text-text-muted">
            Opening balance
            <input className={inputClass + ' mt-1 w-full'} type="number"
              required step="0.01" min="0" value={balance}
              onChange={(e) => setBalance(e.target.value)} />
          </label>
          <Button type="submit" isLoading={saving}>Start Farms ledger</Button>
        </form>
      </Card>
    </div>
  );
}

function FarmsLedger({ openingState }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState('');
  const [particular, setParticular] = useState('');
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ transactions: rows }, { summary: totals }] = await Promise.all([
        farmsApi.listTransactions(), farmsApi.getSummary(),
      ]);
      setTransactions(rows);
      setSummary(totals);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await farmsApi.addTransaction(date, particular, type, Number(amount));
      setDate('');
      setParticular('');
      setAmount('');
      setCurrentPage(1);
      await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const page = transactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><p className="text-xs text-text-muted">Current balance</p>
          <p className="text-xl font-semibold text-text-primary">{money(summary?.currentBalance ?? openingState.opening_balance)}</p></Card>
        <Card><p className="text-xs text-text-muted">Total credit</p>
          <p className="text-xl font-semibold text-success">{money(summary?.totalCredit)}</p></Card>
        <Card><p className="text-xs text-text-muted">Total debit</p>
          <p className="text-xl font-semibold text-danger">{money(summary?.totalDebit)}</p></Card>
      </div>
      {error && <p role="alert" className="bg-danger-bg text-danger text-sm rounded-md p-3">{error}</p>}
      <Card>
        <h2 className="text-sm font-medium text-text-muted mb-3">Add Farms transaction</h2>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input aria-label="Transaction date" type="date" required
            min={openingState.as_of_date} className={inputClass}
            value={date} onChange={(e) => setDate(e.target.value)} />
          <input aria-label="Particular" placeholder="Particular (e.g. birds 9 x 60)"
            required className={inputClass + ' flex-1 min-w-[180px]'}
            value={particular} onChange={(e) => setParticular(e.target.value)} />
          <select aria-label="Transaction type" className={inputClass}
            value={type} onChange={(e) => setType(e.target.value)}>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input aria-label="Amount" type="number" required min="0" step="0.01"
            placeholder="Amount" className={inputClass + ' w-32'}
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" isLoading={saving}>Add transaction</Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-sm font-medium text-text-muted mb-3">Farms ledger</h2>
        {loading ? <Spinner size={24} className="text-accent" /> : (
          <>
            <Table>
              <thead><tr>
                <Th>Date</Th><Th>Particular</Th>
                <Th align="right">Credit</Th><Th align="right">Debit</Th>
                <Th align="right">Balance</Th>
              </tr></thead>
              <tbody>
                {page.length === 0 && <tr><Td>No transactions yet.</Td></tr>}
                {page.map((tx) => (
                  <tr key={tx.id}>
                    <Td>{tx.date}</Td>
                    <Td>{tx.particular}</Td>
                    <Td align="right">{Number(tx.credit) ? money(tx.credit) : '—'}</Td>
                    <Td align="right">{Number(tx.debit) ? money(tx.debit) : '—'}</Td>
                    <Td align="right">{money(tx.balance)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination currentPage={currentPage} totalItems={transactions.length}
              pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
          </>
        )}
      </Card>
      <p className="text-xs text-text-muted">
        Newest entries appear first. Balances are recalculated in transaction-date order,
        including when an older date is entered.
      </p>
    </div>
  );
}

export function FarmsPage() {
  const [openingState, setOpeningState] = useState(undefined);
  const [error, setError] = useState('');

  const loadOpening = useCallback(async () => {
    setError('');
    try {
      const { openingState: value } = await farmsApi.getOpeningState();
      setOpeningState(value);
    } catch (err) { setError(err.message); }
  }, []);

  useEffect(() => { loadOpening(); }, [loadOpening]);
  if (error) return <p role="alert" className="text-danger">{error}</p>;
  if (openingState === undefined) return <Spinner size={24} className="text-accent" />;
  return openingState
    ? <FarmsLedger openingState={openingState} />
    : <OpeningSetup onComplete={loadOpening} />;
}
