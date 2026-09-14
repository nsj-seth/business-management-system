import { useEffect, useState } from 'react';
import { reservesApi } from '../services/reservesApi';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Table, Th, Td } from '../../../components/ui/Table';
import { Spinner } from '../../../components/ui/Spinner';

function SetupForm({ onSetupComplete }) {
  const [asOfDate, setAsOfDate] = useState('');
  const [cumulativeProfit, setCumulativeProfit] = useState('');
  const [cumulativeExpense, setCumulativeExpense] = useState('');
  const [balance, setBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSaving(true);
    try {
      await reservesApi.setupOpeningState(
        asOfDate,
        Number(cumulativeProfit),
        Number(cumulativeExpense),
        Number(balance)
      );
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
        Enter the existing figures from the physical ledger. This is a
        one-time setup — new digital transactions will continue from these values.
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
            <label className="block text-xs font-medium text-text-muted mb-1">Existing Cumulative Profit</label>
            <input
              type="number"
              value={cumulativeProfit}
              onChange={(e) => setCumulativeProfit(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Existing Cumulative Expense</label>
            <input
              type="number"
              value={cumulativeExpense}
              onChange={(e) => setCumulativeExpense(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Existing Reserve Balance</label>
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

function TransactionLedger({ openingState }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [date, setDate] = useState('');
  const [particular, setParticular] = useState('');
  const [type, setType] = useState('profit');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTransactions() {
    setIsLoading(true);
    try {
      const { transactions } = await reservesApi.listTransactions();
      setTransactions(transactions);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleAddTransaction(event) {
  event.preventDefault();
  setErrorMessage('');
  setIsSubmitting(true);
  try {
    await reservesApi.addTransaction(date, particular, type, Number(amount));
    setDate('');
    setParticular('');
    setAmount('');
    await loadTransactions();
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setIsSubmitting(false);
  }
}

  const currentBalance = transactions.length > 0
    ? transactions[transactions.length - 1].balance
    : openingState.opening_balance;

   return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-text-muted">Current Balance</span>
          <span className="text-lg font-semibold text-text-primary">{currentBalance}</span>
        </div>
      </Card>

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
          <input
            placeholder="Particular"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
            required
            className="flex-1 min-w-[140px] bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="profit">Profit</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-32 bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" isLoading={isSubmitting}>Add</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">History</h3>
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
                <Th>Type</Th>
                <Th align="right">Amount</Th>
                <Th align="right">Balance</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-panel-bg">
                  <Td>{tx.date}</Td>
                  <Td>{tx.particular}</Td>
                  <Td>
                    <Badge variant={tx.type === 'profit' ? 'success' : 'danger'}>{tx.type}</Badge>
                  </Td>
                  <Td align="right">{tx.amount}</Td>
                  <Td align="right">{tx.balance}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export function ReservesPage() {
  const [openingState, setOpeningState] = useState(undefined); // undefined = still loading
  const [errorMessage, setErrorMessage] = useState('');

  async function loadOpeningState() {
    try {
      const { openingState } = await reservesApi.getOpeningState();
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

  return openingState
    ? <TransactionLedger openingState={openingState} />
    : <SetupForm onSetupComplete={loadOpeningState} />;
}