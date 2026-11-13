export function Table({ children }) {
  return (
    <div className="ui-table">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, align = 'left' }) {
  return (
    <th className={`px-4 py-3.5 text-xs font-medium uppercase text-text-muted ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} whitespace-nowrap`}>
      {children}
    </th>
  );
}

export function Td({ children, align = 'left' }) {
  return (
    <td className={`px-4 py-3.5 border-t border-border text-text-primary ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} whitespace-nowrap`}>
      {children}
    </td>
  );
}