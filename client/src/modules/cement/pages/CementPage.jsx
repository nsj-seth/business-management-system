import { useEffect, useState } from 'react';
import { cementApi } from '../services/cementApi';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, Th, Td } from '../../../components/ui/Table';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';

function SetupForm({ onSetupComplete }) {
  const [asOfDate, setAsOfDate] = useState('');
  const [balance, setBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSaving(true);
    try {
      await cementApi.setupOpeningState(asOfDate, Number(balance));
      onSetupComplete();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

   return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-text-muted">
        Enter the existing balance from the physical Cement ledger. This is a
        one-time setup — new digital transactions will continue from this value.
      </p>

      {errorMessage && (
        <div className="bg-danger-bg text-danger text-sm px-4 py-2 rounded-md">
          {errorMessage}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">As-of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              required
              className="w-full bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Existing Balance</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
              step="0.01"
              className="w-full bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button type="submit" isLoading={isSaving}>
            {isSaving ? 'Saving...' : 'Start Digital Records'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function CementLedger() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [date, setDate] = useState('');
  const [type, setType] = useState('sale');
  const [bags, setBags] = useState('');
  const [pricePerBag, setPricePerBag] = useState('');
  const [particular, setParticular] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const PAGE_SIZE = 20;

  async function loadData() {
    setIsLoading(true);
    try {
      const [{ transactions }, { summary }] = await Promise.all([
        cementApi.listTransactions(),
        cementApi.getSummary(),
      ]);
      setTransactions(transactions);
      setSummary(summary);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

 async function handleAddTransaction(event) {
  event.preventDefault();
  setErrorMessage('');
  setIsSubmitting(true);
  try {
    await cementApi.addTransaction(
      date,
      type,
      Number(bags),
      Number(pricePerBag),
      particular || undefined
    );
    setDate('');
    setBags('');
    setPricePerBag('');
    setParticular('');
    await loadData();
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setIsSubmitting(false);
  }
}

const sortedTransactions = [...transactions].reverse(); // most recently entered first
const paginatedTransactions = sortedTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);


   return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <p className="text-xs text-text-muted mb-1">Current Balance</p>
            <p className="text-lg font-semibold text-text-primary">{summary.currentBalance}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted mb-1">Bags Sold</p>
            <p className="text-lg font-semibold text-text-primary">{summary.totalBagsSold}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted mb-1">Bags Purchased</p>
            <p className="text-lg font-semibold text-text-primary">{summary.totalBagsPurchased}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted mb-1">Sales Value</p>
            <p className="text-lg font-semibold text-text-primary">{summary.totalSalesValue}</p>
          </Card>
        </div>
      )}

      {errorMessage && (
        <div className="bg-danger-bg text-danger text-sm px-4 py-2 rounded-md">
          {errorMessage}
        </div>
      )}

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Add Transaction</h3>
        <form onSubmit={handleAddTransaction} className="flex flex-wrap gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
          </select>
          <input
            type="number"
            placeholder="Bags"
            value={bags}
            onChange={(e) => setBags(e.target.value)}
            required
            min="1"
            step="1"
            className="w-24 bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="number"
            placeholder="Price per bag"
            value={pricePerBag}
            onChange={(e) => setPricePerBag(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className="w-32 bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            placeholder="Particular (optional)"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
            className="flex-1 min-w-[140px] bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" isLoading={isSubmitting}>Add</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Ledger</h3>
        {isLoading && <p className="text-sm text-text-muted">Loading...</p>}
        {!isLoading && transactions.length === 0 && (
          <p className="text-sm text-text-muted">No transactions yet.</p>
        )}
        {!isLoading && transactions.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Particular</Th>
                <Th align="right">Bags</Th>
                <Th align="right">Price/Bag</Th>
                <Th align="right">CR</Th>
                <Th align="right">DR</Th>
                <Th align="right">Balance</Th>
              </tr>
            </thead>
            <tbody>
  {paginatedTransactions.length === 0 && (
    <tr>
      <Td>
        <span className="text-text-muted">No transactions yet.</span>
      </Td>
    </tr>
  )}
  {paginatedTransactions.map((tx) => (
    <tr key={tx.id} className="hover:bg-panel-bg">
      <Td>{tx.date}</Td>
      <Td>{tx.particular}</Td>
      <Td align="right">{tx.bags}</Td>
      <Td align="right">{tx.price_per_bag}</Td>
      <Td align="right">{tx.cr > 0 ? tx.cr : '—'}</Td>
      <Td align="right">{tx.dr > 0 ? tx.dr : '—'}</Td>
      <Td align="right">{tx.balance}</Td>
    </tr>
  ))}
</tbody>
          </Table>
        )}
        <Pagination
  currentPage={currentPage}
  totalItems={sortedTransactions.length}
  pageSize={PAGE_SIZE}
  onPageChange={setCurrentPage}
/>
      </Card>
    </div>
  );
}

export function CementPage() {
  const [openingState, setOpeningState] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadOpeningState() {
    try {
      const { openingState } = await cementApi.getOpeningState();
      setOpeningState(openingState);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  useEffect(() => {
    loadOpeningState();
  }, []);

  if (errorMessage) return <div className="bg-danger-bg text-danger text-sm px-4 py-2 rounded-md">{errorMessage}</div>;
if (openingState === undefined) return <Spinner size={24} className="text-accent" />;

  return openingState ? <CementLedger /> : <SetupForm onSetupComplete={loadOpeningState} />;
}