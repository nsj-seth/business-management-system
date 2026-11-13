import { Spinner } from './Spinner';

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  secondary: 'bg-panel-bg hover:bg-border text-text-primary border border-border',
};

export function Button({ children, variant = 'primary', isLoading = false, disabled, className = '', ...props }) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner size={16} />}
      {children}
    </button>
  );
}