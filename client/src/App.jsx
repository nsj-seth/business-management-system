import { ThemeToggle } from './components/ui/ThemeToggle';
import { Gem, ArrowRight, BarChart3, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { BakeryDaysPage } from './modules/bakery/pages/BakeryDaysPage';
import { BakeryDayDetailPage } from './modules/bakery/pages/BakeryDayDetailPage';
import { ReservesPage } from './modules/reserves/pages/ReservesPage';
import { CementPage } from './modules/cement/pages/CementPage';
import { FarmsPage } from './modules/farms/pages/FarmsPage';
import { Spinner } from './components/ui/Spinner';
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));

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
    <div className="min-h-dvh grid lg:grid-cols-2 bg-app-bg">
      <aside className="login-art hidden lg:flex flex-col justify-between p-12 xl:p-20 text-white">
        <div className="flex items-center gap-3"><Gem className="text-amber-400" size={30} /><span className="text-xl font-bold">AG Rose <span className="text-amber-400">BMS</span></span></div>
        <div className="max-w-lg py-16"><p className="uppercase tracking-[.2em] text-xs text-blue-300 mb-5">Your business, in focus</p><h1 className="text-5xl font-semibold leading-tight tracking-tight">Clarity for every<br />business decision.</h1><p className="mt-6 text-slate-300 leading-relaxed">Bring your daily operations and financial records together in one organised workspace.</p>
          <div className="mt-10 space-y-5">{[[BarChart3, 'Follow your financial performance'], [Layers, 'Manage all four business modules'], [ShieldCheck, 'Access your authenticated workspace']].map(([Icon, text]) => <div key={text} className="flex items-center gap-3 text-sm text-slate-200"><span className="p-2.5 rounded-xl bg-white/10"><Icon size={18} /></span>{text}</div>)}</div>
        </div><p className="text-xs text-slate-400">AG Rose · Business Management System</p>
      </aside>
      <section className="relative flex items-center justify-center px-6 py-20">
        <div className="absolute right-6 top-6"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden"><Gem className="text-amber-500" /><span className="font-bold text-xl">AG Rose BMS</span></div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent mb-3">Welcome back</p>
          <h2 className="text-3xl font-bold tracking-tight">Sign in to your workspace</h2>
          <p className="text-text-muted text-sm mt-3 mb-8 leading-relaxed">Enter your account details to manage your business records.</p>
          <div className="ui-card bg-surface border border-border p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-2">Email address</label>
              <input
                id="login-email"
                autoComplete="username"
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-panel-bg border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-2">Password</label>
              <input
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-panel-bg border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            {errorMessage && (
              <div role="alert" className="bg-danger-bg text-danger text-sm px-3 py-2 rounded-md">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 min-h-12 bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>
          </div>
          <p className="text-xs text-text-muted text-center mt-6">Contact your administrator if you need account access.</p>
        </div>
      </section>
    </div>
  );
}

function Dashboard() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex justify-center py-16"><Spinner size={28} className="text-accent" /></div>}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/bakery" element={<BakeryDaysPage />} />
        <Route path="/bakery/days/:dayId" element={<BakeryDayDetailPage />} />
        <Route path="/reserves" element={<ReservesPage />} />
        <Route path="/cement" element={<CementPage />} />
        <Route path="/farms" element={<FarmsPage />} />
        <Route path="*" element={<div className="ui-card bg-surface border border-border p-8"><h2 className="text-xl font-semibold">This page could not be found</h2><Link className="inline-block mt-4 text-accent" to="/">Return to dashboard</Link></div>} />
      </Routes>
      </Suspense>
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