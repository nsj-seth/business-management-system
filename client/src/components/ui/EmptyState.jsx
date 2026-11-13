import { Inbox } from 'lucide-react';
export function EmptyState({ children }) {
  return <div className="flex flex-col items-center justify-center gap-3 py-10 text-center"><span className="p-3 rounded-2xl bg-accent/5 text-accent"><Inbox size={24} /></span><p className="text-sm text-text-muted">{children}</p></div>;
}
