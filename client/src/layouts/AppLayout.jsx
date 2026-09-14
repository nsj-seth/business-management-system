import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({ children }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-app-bg">
      {/* Backdrop, shown only when the mobile drawer is open */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <Sidebar isMobileNavOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}