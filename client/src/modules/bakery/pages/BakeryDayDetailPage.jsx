import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bakeryApi } from '../services/bakeryApi';

export function BakeryDayDetailPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();

  const [day, setDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [salesperson, setSalesperson] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  async function loadDay() {
    setIsLoading(true);
    try {
      const { day } = await bakeryApi.getDay(dayId);
      setDay(day);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDay();
  }, [dayId]);

  async function handleAddSale(event) {
    event.preventDefault();
    setErrorMessage('');
    try {
      await bakeryApi.addSale(dayId, salesperson, Number(saleAmount));
      setSalesperson('');
      setSaleAmount('');
      await loadDay();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleAddExpense(event) {
    event.preventDefault();
    setErrorMessage('');
    try {
      await bakeryApi.addExpense(dayId, description, Number(expenseAmount));
      setDescription('');
      setExpenseAmount('');
      await loadDay();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCompleteDay() {
    setErrorMessage('');
    const confirmed = window.confirm(
      'Completing this day will lock it permanently. Continue?'
    );
    if (!confirmed) return;

    try {
      await bakeryApi.completeDay(dayId);
      await loadDay();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) return <p>Loading...</p>;
  if (!day) return <p>Day not found.</p>;

  const isLocked = day.status === 'completed';

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <Link to="/bakery">&larr; Back to days</Link>
      <h1>
        {day.date} <span style={{ fontSize: '0.9rem', color: '#666' }}>({day.status})</span>
      </h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1.5rem' }}>
        <h2>Daily Summary</h2>
        <p>Opening Balance: {day.opening_balance}</p>
        <p>Total Sales: {day.total_sales}</p>
        <p>Total Expenses: {day.total_expenses}</p>
        <p><strong>Closing Balance: {day.closing_balance}</strong></p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Sales</h2>
        <ul>
          {day.sales.map((sale) => (
            <li key={sale.id}>{sale.salesperson} — {sale.amount}</li>
          ))}
        </ul>
        {!isLocked && (
          <form onSubmit={handleAddSale}>
            <input
              placeholder="Salesperson"
              value={salesperson}
              onChange={(e) => setSalesperson(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={saleAmount}
              onChange={(e) => setSaleAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
            <button type="submit">+ Add Sale</button>
          </form>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Expenses</h2>
        <ul>
          {day.expenses.map((expense) => (
            <li key={expense.id}>{expense.description} — {expense.amount}</li>
          ))}
        </ul>
        {!isLocked && (
          <form onSubmit={handleAddExpense}>
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
            <button type="submit">+ Add Expense</button>
          </form>
        )}
      </section>

      {!isLocked && (
        <button onClick={handleCompleteDay}>Complete Day</button>
      )}
    </div>
  );
}