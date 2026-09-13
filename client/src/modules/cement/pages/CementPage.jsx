import { useEffect, useState } from 'react';
import { cementApi } from '../services/cementApi';

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
    <div className="page">
      <h1>Cement Setup</h1>
      <p className="text-muted">
        Enter the existing balance from the physical Cement ledger. This is a
        one-time setup — new digital transactions will continue from this value.
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
          <label>Existing Balance</label>
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
    }
  }

  return (
    <div className="page">
      <h1>Cement</h1>

      {summary && (
        <div className="card">
          <div className="summary-row"><span>Current Balance</span><span>{summary.currentBalance}</span></div>
          <div className="summary-row"><span>Total Bags Sold</span><span>{summary.totalBagsSold}</span></div>
          <div className="summary-row"><span>Total Bags Purchased</span><span>{summary.totalBagsPurchased}</span></div>
          <div className="summary-row"><span>Total Sales Value</span><span>{summary.totalSalesValue}</span></div>
          <div className="summary-row"><span>Total Purchase Value</span><span>{summary.totalPurchaseValue}</span></div>
        </div>
      )}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="card">
        <h2>Add Transaction</h2>
        <form onSubmit={handleAddTransaction} className="inline-form">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <select value={type} onChange={(e) => setType(e.target.value)}>
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
          />
          <input
            type="number"
            placeholder="Price per bag"
            value={pricePerBag}
            onChange={(e) => setPricePerBag(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
          <input
            placeholder="Particular (optional)"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
          />
          <button type="submit" className="btn">Add</button>
        </form>
      </div>

      <div className="card">
        <h2>Ledger</h2>
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
                <th style={{ textAlign: 'right' }}>Bags</th>
                <th style={{ textAlign: 'right' }}>Price/Bag</th>
                <th style={{ textAlign: 'right' }}>CR</th>
                <th style={{ textAlign: 'right' }}>DR</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.particular}</td>
                  <td style={{ textAlign: 'right' }}>{tx.bags}</td>
                  <td style={{ textAlign: 'right' }}>{tx.price_per_bag}</td>
                  <td style={{ textAlign: 'right' }}>{tx.cr > 0 ? tx.cr : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{tx.dr > 0 ? tx.dr : '—'}</td>
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

  if (errorMessage) return <p className="error-text">{errorMessage}</p>;
  if (openingState === undefined) return <p>Loading...</p>;

  return openingState ? <CementLedger /> : <SetupForm onSetupComplete={loadOpeningState} />;
}