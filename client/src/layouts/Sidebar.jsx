import { NavLink } from 'react-router-dom';
import { X, Gem, ArrowUpRight } from 'lucide-react';
import { navigation } from '../config/navigation';

export function Sidebar({ isMobileNavOpen, onClose }) {
  return <aside id="main-navigation" className={`w-64 shrink-0 bg-panel-bg border-r border-border flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-200 md:static md:translate-x-0 ${isMobileNavOpen ? 'translate-x-0 visible' : '-translate-x-full invisible md:visible'}`}>
    <div className="h-20 flex items-center justify-between px-6 border-b border-border">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500"><Gem size={23} /></span><div><p className="text-lg font-bold tracking-tight">AG Rose <span className="text-amber-500">BMS</span></p><p className="text-[10px] uppercase tracking-[.18em] text-text-muted">Business management</p></div></div>
      <button onClick={onClose} className="md:hidden text-text-muted" aria-label="Close navigation"><X size={20} /></button>
    </div>
    <nav aria-label="Main navigation" className="flex-1 px-4 py-7 space-y-2">
      <p className="px-3 mb-4 text-[10px] font-semibold tracking-[.18em] uppercase text-text-muted">Overview & operations</p>
      {navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={onClose} className={({ isActive }) => `group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-app-bg hover:text-text-primary'}`}><Icon size={19} /><span className="flex-1">{label}</span><ArrowUpRight size={14} className="opacity-40" /></NavLink>)}
    </nav>
    <div className="m-4 p-4 rounded-xl border border-border bg-app-bg"><p className="text-xs font-semibold">One workspace. Every operation.</p><p className="text-xs text-text-muted leading-relaxed mt-2">Keep daily records and financial activity organised across your businesses.</p></div>
  </aside>;
}
