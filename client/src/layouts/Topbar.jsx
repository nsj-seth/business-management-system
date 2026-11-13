import { useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { navigation } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export function Topbar({ onMenuClick, isMobileNavOpen }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const page = navigation.find(item => item.path === '/' ? pathname === '/' : pathname.startsWith(item.path));
  return <header className="h-20 shrink-0 bg-panel-bg border-b border-border flex items-center justify-between gap-3 px-4 md:px-8">
    <div className="flex items-center gap-3">
      <button className="icon-button md:hidden!" aria-label="Open navigation" aria-expanded={isMobileNavOpen} aria-controls="main-navigation" onClick={onMenuClick}><Menu size={20} /></button>
      <div><p className="text-xs text-text-muted">Workspace /</p><p className="text-sm font-semibold mt-1">{page?.label || 'Business management'}</p></div>
    </div>
    <div className="flex items-center gap-2 sm:gap-4">
      <ThemeToggle />
      <div className="hidden sm:flex items-center gap-3 border-l border-border pl-4">
        <span className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
        <div><p className="text-sm font-medium max-w-48 truncate">{user?.email}</p><p className="text-xs text-text-muted">Business workspace</p></div>
      </div>
      <button onClick={signOut} className="icon-button" aria-label="Log out" title="Log out"><LogOut size={18} /></button>
    </div>
  </header>;
}
