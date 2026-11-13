export function Card({ children, className = '' }) {
  return (
    <div className={`ui-card bg-surface border border-border rounded-lg p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
}