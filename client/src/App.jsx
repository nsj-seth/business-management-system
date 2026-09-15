import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { BakeryDaysPage } from './modules/bakery/pages/BakeryDaysPage';
import { BakeryDayDetailPage } from './modules/bakery/pages/BakeryDayDetailPage';
import { ReservesPage } from './modules/reserves/pages/ReservesPage';
import { CementPage } from './modules/cement/pages/CementPage';
import { Spinner } from './components/ui/Spinner';
import { DashboardPage } from './pages/DashboardPage';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-6">
          <span className="text-xl font-bold tracking-tight">
    <span className="text-slate-100">AG Rose </span>
    <span className="text-amber-400">BMS</span>
  </span>
        </h1>
        <div className="bg-surface border border-border rounded-lg p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-panel-bg border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-panel-bg border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            {errorMessage && (
              <div className="bg-danger-bg text-danger text-sm px-3 py-2 rounded-md">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/bakery" element={<BakeryDaysPage />} />
        <Route path="/bakery/days/:dayId" element={<BakeryDayDetailPage />} />
        <Route path="/reserves" element={<ReservesPage />} />
        <Route path="/cement" element={<CementPage />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  const { user, isLoading } = useAuth();

 if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg">
      <Spinner size={32} className="text-accent" />
    </div>
  );
}

  return user ? <Dashboard /> : <LoginForm />;
}

export default App;