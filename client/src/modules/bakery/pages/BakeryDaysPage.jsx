import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bakeryApi } from '../services/bakeryApi';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Table, Th, Td } from '../../../components/ui/Table';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';


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
  const [currentPage, setCurrentPage] = useState(1);
const PAGE_SIZE = 20;

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
      setCurrentPage(1);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCreating(false);
    }
  }

if (isLoading) return <Spinner size={24} className="text-accent" />;

const sortedDays = [...days].reverse(); // most recent first
const paginatedDays = sortedDays.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-danger-bg text-danger text-sm px-4 py-2 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleCreateNextDay} isLoading={isCreating}>
          {isCreating ? 'Creating...' : `Create ${getNextDate(days)}`}
        </Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Reference</Th>
              <Th align="right">Closing Balance</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
  {paginatedDays.length === 0 && (
    <tr>
      <Td>
        <span className="text-text-muted">No days yet.</span>
      </Td>
    </tr>
  )}
  {paginatedDays.map((day) => (
    <tr key={day.id} className="hover:bg-panel-bg">
      <Td>
        <Link to={`/bakery/days/${day.id}`} className="text-accent hover:underline">
          {day.date}
        </Link>
      </Td>
      <Td>{day.reference_number}</Td>
      <Td align="right">{day.closing_balance}</Td>
      <Td>
        <Badge variant={day.status === 'completed' ? 'success' : 'warning'}>
          {day.status}
        </Badge>
      </Td>
    </tr>
  ))}
</tbody>
        </Table>
        <Pagination
  currentPage={currentPage}
  totalItems={sortedDays.length}
  pageSize={PAGE_SIZE}
  onPageChange={setCurrentPage}
/>
      </Card>
    </div>
  );

}