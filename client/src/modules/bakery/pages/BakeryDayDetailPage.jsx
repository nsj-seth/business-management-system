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
    <div className="page">
      <Link to="/bakery">&larr; Back to days</Link>
      <h1>
        {day.date} <span className={`badge badge-${day.status}`}>{day.status}</span>
      </h1>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="card">
        <h2>Daily Summary</h2>
        <div className="summary-row"><span>Opening Balance</span><span>{day.opening_balance}</span></div>
        <div className="summary-row"><span>Total Sales</span><span>{day.total_sales}</span></div>
        <div className="summary-row"><span>Total Expenses</span><span>{day.total_expenses}</span></div>
        <div className="summary-row"><span>Closing Balance</span><span>{day.closing_balance}</span></div>
      </div>

      <div className="card">
        <h2>Sales</h2>
        {day.sales.length === 0 && <p className="text-muted">No sales yet.</p>}
        {day.sales.map((sale) => (
          <div className="summary-row" key={sale.id}>
            <span>{sale.salesperson}</span><span>{sale.amount}</span>
          </div>
        ))}
        {!isLocked && (
          <form onSubmit={handleAddSale} className="inline-form">
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
            <button type="submit" className="btn">+ Add Sale</button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Expenses</h2>
        {day.expenses.length === 0 && <p className="text-muted">No expenses yet.</p>}
        {day.expenses.map((expense) => (
          <div className="summary-row" key={expense.id}>
            <span>{expense.description}</span><span>{expense.amount}</span>
          </div>
        ))}
        {!isLocked && (
          <form onSubmit={handleAddExpense} className="inline-form">
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
            <button type="submit" className="btn">+ Add Expense</button>
          </form>
        )}
      </div>

      {!isLocked && (
        <button onClick={handleCompleteDay} className="btn">Complete Day</button>
      )}
    </div>
  );
}