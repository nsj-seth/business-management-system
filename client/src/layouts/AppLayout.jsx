import { useEffect, useState } from 'react';
import { PageIntro } from '../components/ui/PageIntro';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({ children }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previous = document.activeElement;
    const sidebar = document.getElementById('main-navigation');
    const focusable = () => [...sidebar.querySelectorAll('a, button')].filter(el => el.getClientRects().length);
    focusable()[0]?.focus();
    const close = (event) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const media = window.matchMedia('(min-width: 768px)');
    const resize = () => { if (media.matches) setIsMobileNavOpen(false); };
    media.addEventListener('change', resize);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('keydown', close); media.removeEventListener('change', resize); previous?.focus(); };
  }, [isMobileNavOpen]);

  return (
    <div className="flex h-dvh bg-app-bg">
      {/* Backdrop, shown only when the mobile drawer is open */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <Sidebar isMobileNavOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      <div inert={isMobileNavOpen || undefined} className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <Topbar isMobileNavOpen={isMobileNavOpen} onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1440px] mx-auto"><PageIntro />{children}</div>
        </main>
      </div>
    </div>
  );
}