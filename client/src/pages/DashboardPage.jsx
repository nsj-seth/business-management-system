import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
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

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const day = date.getUTCDay();
  const diffFromThursday = (day - 4 + 7) % 7;
  date.setUTCDate(date.getUTCDate() - diffFromThursday);
  return date.toISOString().slice(0, 10);
}

function aggregateSumByPeriod({ items, dateField, periodKeyFn, periodLabelFn, field1Name, field1Getter, field2Name, field2Getter, limit }) {
  const buckets = {};
  items.forEach((item) => {
    const key = periodKeyFn(item[dateField]);
    if (!buckets[key]) {
      buckets[key] = { key, label: periodLabelFn(key), [field1Name]: 0, [field2Name]: 0 };
    }
    buckets[key][field1Name] += field1Getter(item);
    buckets[key][field2Name] += field2Getter(item);
  });
  return Object.values(buckets).sort((a, b) => (a.key < b.key ? -1 : 1)).slice(-limit);
}

function buildSumDatasets(items, dateField, field1Name, field1Getter, field2Name, field2Getter) {
  const common = { items, dateField, field1Name, field1Getter, field2Name, field2Getter };
  return {
    daily: aggregateSumByPeriod({ ...common, periodKeyFn: (d) => d, periodLabelFn: (k) => k.slice(5), limit: 7 }),
    weekly: aggregateSumByPeriod({ ...common, periodKeyFn: getWeekStart, periodLabelFn: (k) => k.slice(5), limit: 8 }),
    monthly: aggregateSumByPeriod({ ...common, periodKeyFn: (d) => d.slice(0, 7), periodLabelFn: (k) => k, limit: 6 }),
  };
}

function aggregateBalanceByPeriod({ transactions, periodKeyFn, periodLabelFn, limit, openingBalance }) {
  const buckets = {};
  transactions.forEach((tx) => {
    const key = periodKeyFn(tx.date);
    buckets[key] = { key, label: periodLabelFn(key), balance: Number(tx.balance) };
  });
  const points = Object.values(buckets).sort((a, b) => (a.key < b.key ? -1 : 1));
  return [{ label: 'Opening', balance: Number(openingBalance) }, ...points].slice(-(limit + 1));
}

function buildBalanceDatasets(openingBalance, transactions) {
  const common = { transactions, openingBalance };
  return {
    daily: aggregateBalanceByPeriod({ ...common, periodKeyFn: (d) => d, periodLabelFn: (k) => k.slice(5), limit: 9 }),
    weekly: aggregateBalanceByPeriod({ ...common, periodKeyFn: getWeekStart, periodLabelFn: (k) => k.slice(5), limit: 8 }),
    monthly: aggregateBalanceByPeriod({ ...common, periodKeyFn: (d) => d.slice(0, 7), periodLabelFn: (k) => k, limit: 6 }),
  };
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

  const bakeryDatasets = buildSumDatasets(
    bakeryDays.filter((d) => d.status === 'completed'),
    'date',
    'Sales', (d) => Number(d.total_sales),
    'Expenses', (d) => Number(d.total_expenses)
  );

  const reservesDatasets = buildBalanceDatasets(
    reservesOpening ? reservesOpening.opening_balance : 0,
    reservesTx
  );

  const cementDatasets = buildBalanceDatasets(
    cementOpening ? cementOpening.opening_balance : 0,
    cementTx
  );

  return (
    <DashboardView
      bakeryBalance={bakeryBalance}
      reservesBalance={reservesBalance}
      cementBalance={cementSummary.currentBalance}
      todaysDay={todaysDay}
      bakeryDatasets={bakeryDatasets}
      reservesDatasets={reservesDatasets}
      cementDatasets={cementDatasets}
    />
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
    </Card>
  );
}

function PeriodToggle({ mode, onChange }) {
  return (
    <div className="flex gap-1">
      {['daily', 'weekly', 'monthly'].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-2.5 py-1 text-xs rounded-md capitalize ${
            mode === m ? 'bg-accent text-white' : 'text-text-muted hover:bg-panel-bg'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function PeriodBarChartCard({ title, datasets, field1Name, field1Color, field2Name, field2Color }) {
  const [mode, setMode] = useState('daily');
  const chartData = datasets[mode];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-muted">{title}</h3>
        <PeriodToggle mode={mode} onChange={setMode} />
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-text-muted">Not enough data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a2133', border: '1px solid #242b3d', fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={field1Name} fill={field1Color} radius={[4, 4, 0, 0]} />
            <Bar dataKey={field2Name} fill={field2Color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

function PeriodLineChartCard({ title, datasets, color }) {
  const [mode, setMode] = useState('daily');
  const chartData = datasets[mode];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-muted">{title}</h3>
        <PeriodToggle mode={mode} onChange={setMode} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ background: '#1a2133', border: '1px solid #242b3d', fontSize: 13 }} />
          <Line type="monotone" dataKey="balance" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DashboardView({
  bakeryBalance,
  reservesBalance,
  cementBalance,
  todaysDay,
  bakeryDatasets,
  reservesDatasets,
  cementDatasets,
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
        <PeriodBarChartCard
          title="Bakery: Sales vs Expenses"
          datasets={bakeryDatasets}
          field1Name="Sales"
          field1Color="#22c55e"
          field2Name="Expenses"
          field2Color="#ef4444"
        />
        <PeriodLineChartCard
          title="Reserves Balance Trend"
          datasets={reservesDatasets}
          color="#3b82f6"
        />
      </div>

      <PeriodLineChartCard
        title="Cement Balance Trend"
        datasets={cementDatasets}
        color="#f59e0b"
      />
    </div>
  );
}