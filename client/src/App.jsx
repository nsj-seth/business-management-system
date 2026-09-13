import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import { BakeryDaysPage } from './modules/bakery/pages/BakeryDaysPage';
import { BakeryDayDetailPage } from './modules/bakery/pages/BakeryDayDetailPage';
import { ReservesPage } from './modules/reserves/pages/ReservesPage';
import { CementPage } from './modules/cement/pages/CementPage';


function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (data.session) {
  console.log('token:', data.session.access_token);
}
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-page">
      <h1>Business Management System</h1>
      <form onSubmit={handleLogin} className="card">
        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-text">{errorMessage}</p>}
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/bakery">Bakery</Link>
          <Link to="/reserves">Reserves</Link>
          <Link to="/cement">Cement</Link>
        </div>
        <div className="navbar-user">
          <span>{user.email}</span>
          <button onClick={signOut} className="btn btn-secondary">Log out</button>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="page">
              <h1>Welcome</h1>
              <p className="text-muted">AG Rose Business Management System</p>
            </div>
          }
        />
        <Route path="/bakery" element={<BakeryDaysPage />} />
        <Route path="/bakery/days/:dayId" element={<BakeryDayDetailPage />} />
        <Route path="/reserves" element={<ReservesPage />} />
        <Route path="/cement" element={<CementPage />} />
      </Routes>
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</p>;
  }

  return user ? <Dashboard /> : <LoginForm />;
}

export default App;