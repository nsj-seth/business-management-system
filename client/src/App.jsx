import { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Link } from 'react-router-dom';
import { BakeryDaysPage } from './modules/bakery/pages/BakeryDaysPage';
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
// if (data.session) {
//   console.log('token:', data.session.access_token);
// }
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    }
    // No need to manually handle success here -- onAuthStateChange
    // in AuthContext picks up the new session automatically, and
    // the whole app re-renders to show the logged-in view.
  };

  return (
    <div style={{ maxWidth: 320, margin: '4rem auto', fontFamily: 'sans-serif' }}>
      <h1>Business Management System</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/bakery" style={{ marginRight: '1rem' }}>Bakery</Link>
        <span style={{ float: 'right' }}>
          {user.email} <button onClick={signOut}>Log out</button>
        </span>
      </nav>

      <Routes>
        <Route path="/" element={<p style={{ padding: '1rem' }}>Welcome to the Business Management System.</p>} />
        <Route path="/bakery" element={<BakeryDaysPage />} />
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