import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('ag-rose-theme', theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);
  const next = theme === 'light' ? 'dark' : 'light';
  return <button type="button" className="icon-button" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} onClick={() => setTheme(next)}>
    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
  </button>;
}
