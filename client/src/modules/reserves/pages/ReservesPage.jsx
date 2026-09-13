import { useEffect, useState } from 'react';
import { reservesApi } from '../services/reservesApi';

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
    <div className="page">
      <h1>Reserves Setup</h1>
      <p className="text-muted">
        Enter the existing figures from the physical ledger. This is a one-time
        setup — new digital transactions will continue from these values.
      </p>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-field">
          <label>As-of Date</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Existing Cumulative Profit</label>
          <input
            type="number"
            value={cumulativeProfit}
            onChange={(e) => setCumulativeProfit(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-field">
          <label>Existing Cumulative Expense</label>
          <input
            type="number"
            value={cumulativeExpense}
            onChange={(e) => setCumulativeExpense(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-field">
          <label>Existing Reserve Balance</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
            step="0.01"
          />
        </div>
        <button type="submit" className="btn" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Start Digital Records'}
        </button>
      </form>
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
    try {
      await reservesApi.addTransaction(date, particular, type, Number(amount));
      setDate('');
      setParticular('');
      setAmount('');
      await loadTransactions();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const currentBalance = transactions.length > 0
    ? transactions[transactions.length - 1].balance
    : openingState.opening_balance;

  return (
    <div className="page">
      <h1>Reserves</h1>

      <div className="card">
        <div className="summary-row">
          <span>Current Balance</span>
          <span>{currentBalance}</span>
        </div>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="card">
        <h2>Add Transaction</h2>
        <form onSubmit={handleAddTransaction} className="inline-form">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            placeholder="Particular"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
            required
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
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
          />
          <button type="submit" className="btn">Add</button>
        </form>
      </div>

      <div className="card">
        <h2>History</h2>
        {isLoading && <p>Loading...</p>}
        {!isLoading && transactions.length === 0 && (
          <p className="text-muted">No transactions yet.</p>
        )}
        {!isLoading && transactions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Particular</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.particular}</td>
                  <td>
                    <span className={`badge ${tx.type === 'profit' ? 'badge-completed' : 'badge-open'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{tx.amount}</td>
                  <td style={{ textAlign: 'right' }}>{tx.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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

  if (errorMessage) return <p className="error-text">{errorMessage}</p>;
  if (openingState === undefined) return <p>Loading...</p>;

  return openingState
    ? <TransactionLedger openingState={openingState} />
    : <SetupForm onSetupComplete={loadOpeningState} />;
}