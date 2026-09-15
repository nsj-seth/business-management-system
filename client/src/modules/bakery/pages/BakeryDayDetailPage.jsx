import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bakeryApi } from '../services/bakeryApi';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

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
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
const [isCompleting, setIsCompleting] = useState(false);
const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

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
  setIsSubmittingSale(true);
  try {
    await bakeryApi.addSale(dayId, salesperson, Number(saleAmount));
    setSalesperson('');
    setSaleAmount('');
    await loadDay();
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setIsSubmittingSale(false);
  }
}

 async function handleAddExpense(event) {
  event.preventDefault();
  setErrorMessage('');
  setIsSubmittingExpense(true);
  try {
    await bakeryApi.addExpense(dayId, description, Number(expenseAmount));
    setDescription('');
    setExpenseAmount('');
    await loadDay();
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setIsSubmittingExpense(false);
  }
}

async function handleCompleteDay() {
  setErrorMessage('');
  setIsCompleting(true);
  try {
    await bakeryApi.completeDay(dayId);
    await loadDay();
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setIsCompleting(false);
    setShowCompleteConfirm(false);
  }
}

 if (isLoading) return <Spinner size={24} className="text-accent" />;
  if (!day) return <p>Day not found.</p>;

  const isLocked = day.status === 'completed';

 return (
    <div className="space-y-4">
      <Link to="/bakery" className="text-sm text-accent hover:underline">
        &larr; Back to days
      </Link>

      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{day.date}</h2>
        <Badge variant={isLocked ? 'success' : 'warning'}>{day.status}</Badge>
      </div>

      {errorMessage && (
        <div className="bg-danger-bg text-danger text-sm px-4 py-2 rounded-md">
          {errorMessage}
        </div>
      )}

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Daily Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Opening Balance</span>
            <span className="text-text-primary">{day.opening_balance}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Total Sales</span>
            <span className="text-text-primary">{day.total_sales}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Total Expenses</span>
            <span className="text-text-primary">{day.total_expenses}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
            <span className="text-text-primary">Closing Balance</span>
            <span className="text-text-primary">{day.closing_balance}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Sales</h3>
        {day.sales.length === 0 && <p className="text-sm text-text-muted mb-3">No sales yet.</p>}
        <div className="space-y-2 mb-3">
          {day.sales.map((sale) => (
            <div key={sale.id} className="flex justify-between text-sm">
              <span className="text-text-primary">{sale.salesperson}</span>
              <span className="text-text-primary">{sale.amount}</span>
            </div>
          ))}
        </div>
        {!isLocked && (
          <form onSubmit={handleAddSale} className="flex flex-wrap gap-2">
            <input
              placeholder="Salesperson"
              value={salesperson}
              onChange={(e) => setSalesperson(e.target.value)}
              required
              className="flex-1 min-w-[140px] bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="number"
              placeholder="Amount"
              value={saleAmount}
              onChange={(e) => setSaleAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-32 bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" isLoading={isSubmittingSale}>+ Add Sale</Button>
          </form>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Expenses</h3>
        {day.expenses.length === 0 && <p className="text-sm text-text-muted mb-3">No expenses yet.</p>}
        <div className="space-y-2 mb-3">
          {day.expenses.map((expense) => (
            <div key={expense.id} className="flex justify-between text-sm">
              <span className="text-text-primary">{expense.description}</span>
              <span className="text-text-primary">{expense.amount}</span>
            </div>
          ))}
        </div>
        {!isLocked && (
          <form onSubmit={handleAddExpense} className="flex flex-wrap gap-2">
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="flex-1 min-w-[140px] bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="number"
              placeholder="Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-32 bg-panel-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" isLoading={isSubmittingExpense}>
              + Add Expense
            </Button>
          </form>
        )}
      </Card>

      {!isLocked && (
        <Button onClick={() => setShowCompleteConfirm(true)} variant="secondary" isLoading={isCompleting}>
  Complete Day
</Button>
      )}


      <ConfirmDialog
  isOpen={showCompleteConfirm}
  title="Complete this day?"
  message="Completing this day will lock it permanently. Sales and expenses can no longer be added once it's completed."
  confirmLabel="Complete Day"
  isLoading={isCompleting}
  onConfirm={handleCompleteDay}
  onCancel={() => setShowCompleteConfirm(false)}
/>
    </div>
  );
}