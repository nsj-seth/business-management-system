export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-4 md:p-5 ${className}`}>
      {children}
    </div>
  );
}