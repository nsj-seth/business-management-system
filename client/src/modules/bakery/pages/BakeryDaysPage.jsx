import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bakeryApi } from '../services/bakeryApi';

// Given the most recent day, works out the date that should be
// created next: the day after it, or today if no days exist yet.
function getNextDate(days) {
  if (days.length === 0) {
    return new Date().toISOString().slice(0, 10);
  }
  const mostRecent = days[days.length - 1]; // days are sorted oldest-first
  const next = new Date(`${mostRecent.date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function BakeryDaysPage() {
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function loadDays() {
    setIsLoading(true);
    try {
      const { days } = await bakeryApi.listDays();
      setDays(days);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDays();
  }, []);

  async function handleCreateNextDay() {
    setErrorMessage('');
    setIsCreating(true);
    try {
      await bakeryApi.createDay(getNextDate(days));
      await loadDays(); // refresh the list to include the new day
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) return <p>Loading...</p>;

    return (
    <div className="page">
      <h1>Bakery</h1>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <button onClick={handleCreateNextDay} disabled={isCreating} className="btn">
        {isCreating ? 'Creating...' : `Create ${getNextDate(days)}`}
      </button>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th style={{ textAlign: 'right' }}>Closing Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {days.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">No days yet.</td>
              </tr>
            )}
            {days.map((day) => (
              <tr key={day.id}>
                <td><Link to={`/bakery/days/${day.id}`}>{day.date}</Link></td>
                <td>{day.reference_number}</td>
                <td style={{ textAlign: 'right' }}>{day.closing_balance}</td>
                <td>
                  <span className={`badge badge-${day.status}`}>{day.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

}