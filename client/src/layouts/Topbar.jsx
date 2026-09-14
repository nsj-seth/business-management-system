import { useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { navigation } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';

export function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const currentPage = navigation.find((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <header className="h-16 shrink-0 bg-panel-bg border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-text-muted">
          <Menu size={22} />
        </button>
        <h1 className="text-base font-semibold text-text-primary">
          {currentPage?.label ?? ''}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-text-muted">{user.email}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}