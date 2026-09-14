import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { navigation } from '../config/navigation';

export function Sidebar({ isMobileNavOpen, onClose }) {
  return (
    <aside
      className={`
        w-60 shrink-0 bg-panel-bg border-r border-border flex flex-col
        fixed inset-y-0 left-0 z-30 transition-transform duration-200
        md:static md:translate-x-0
        ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <span className="text-lg font-bold text-text-primary">BMS</span>
        <button onClick={onClose} className="md:hidden text-text-muted">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:bg-surface hover:text-text-primary'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}