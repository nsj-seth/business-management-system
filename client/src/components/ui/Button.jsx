const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  secondary: 'bg-surface hover:bg-border text-text-primary border border-border',
};

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}