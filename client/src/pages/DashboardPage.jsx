import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { bakeryApi } from '../modules/bakery/services/bakeryApi';
import { reservesApi } from '../modules/reserves/services/reservesApi';
import { cementApi } from '../modules/cement/services/cementApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

// Builds a simple "balance over time" series for a line chart from
// an opening state plus a module's transaction history (both
// already in entry order, oldest first).
function buildBalanceTrend(openingBalance, transactions) {
  const points = [{ label: 'Opening', balance: Number(openingBalance) }];
  transactions.slice(-9).forEach((tx) => {
    points.push({ label: tx.date, balance: Number(tx.balance) });
  });
  return points;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          { days: bakeryDays },
          { openingState: reservesOpening },
          { transactions: reservesTx },
          { summary: cementSummary },
          { openingState: cementOpening },
          { transactions: cementTx },
        ] = await Promise.all([
          bakeryApi.listDays(),
          reservesApi.getOpeningState(),
          reservesApi.listTransactions(),
          cementApi.getSummary(),
          cementApi.getOpeningState(),
          cementApi.listTransactions(),
        ]);

        setData({ bakeryDays, reservesOpening, reservesTx, cementSummary, cementOpening, cementTx });
      } catch (error) {
        setErrorMessage(error.message);
      }
    }

    loadDashboard();
  }, []);

  if (errorMessage) {
    return <div className="bg-danger-bg text-danger text-sm px-4 py-2 rounded-md">{errorMessage}</div>;
  }
  if (!data) return <Spinner size={24} className="text-accent" />;

  const { bakeryDays, reservesOpening, reservesTx, cementSummary, cementOpening, cementTx } = data;

  const mostRecentBakeryDay = bakeryDays[bakeryDays.length - 1];
  const bakeryBalance = mostRecentBakeryDay ? mostRecentBakeryDay.closing_balance : 0;
  const reservesBalance = reservesTx.length > 0
    ? reservesTx[reservesTx.length - 1].balance
    : (reservesOpening ? reservesOpening.opening_balance : 0);

  const todaysDay = bakeryDays.find((day) => day.date === todayDateString());

  const weeklyChartData = bakeryDays
    .filter((day) => day.status === 'completed')
    .slice(-7)
    .map((day) => ({
      date: day.date.slice(5), // MM-DD, compact for the chart axis
      Sales: Number(day.total_sales),
      Expenses: Number(day.total_expenses),
    }));

  const reservesTrend = buildBalanceTrend(
    reservesOpening ? reservesOpening.opening_balance : 0,
    reservesTx
  );
  const cementTrend = buildBalanceTrend(
    cementOpening ? cementOpening.opening_balance : 0,
    cementTx
  );

  return <DashboardView
    bakeryBalance={bakeryBalance}
    reservesBalance={reservesBalance}
    cementBalance={cementSummary.currentBalance}
    todaysDay={todaysDay}
    weeklyChartData={weeklyChartData}
    reservesTrend={reservesTrend}
    cementTrend={cementTrend}
  />;
}


function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
    </Card>
  );
}

function DashboardView({
  bakeryBalance,
  reservesBalance,
  cementBalance,
  todaysDay,
  weeklyChartData,
  reservesTrend,
  cementTrend,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Bakery Balance" value={bakeryBalance} />
        <StatCard label="Reserves Balance" value={reservesBalance} />
        <StatCard label="Cement Balance" value={cementBalance} />
      </div>

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Today's Bakery Status</h3>
        {todaysDay ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant={todaysDay.status === 'completed' ? 'success' : 'warning'}>
                {todaysDay.status}
              </Badge>
              <Link
                to={`/bakery/days/${todaysDay.id}`}
                className="text-sm text-accent hover:underline"
              >
                View day
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm pt-2">
              <div>
                <p className="text-text-muted text-xs">Opening</p>
                <p className="text-text-primary">{todaysDay.opening_balance}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Sales so far</p>
                <p className="text-text-primary">{todaysDay.total_sales}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Expenses so far</p>
                <p className="text-text-primary">{todaysDay.total_expenses}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-muted">
            No bakery day has been created for today yet.{' '}
            <Link to="/bakery" className="text-accent hover:underline">
              Go create it
            </Link>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-text-muted mb-3">
            Bakery: Sales vs Expenses (last 7 completed days)
          </h3>
          {weeklyChartData.length === 0 ? (
            <p className="text-sm text-text-muted">Not enough completed days yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1a2133', border: '1px solid #242b3d', fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-text-muted mb-3">Reserves Balance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={reservesTrend}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1a2133', border: '1px solid #242b3d', fontSize: 13 }}
              />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-text-muted mb-3">Cement Balance Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cementTrend}>
            <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#1a2133', border: '1px solid #242b3d', fontSize: 13 }}
            />
            <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}