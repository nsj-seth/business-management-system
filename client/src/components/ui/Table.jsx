export function Table({ children }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, align = 'left' }) {
  return (
    <th className={`px-3 py-2 text-xs font-medium uppercase text-text-muted text-${align} whitespace-nowrap`}>
      {children}
    </th>
  );
}

export function Td({ children, align = 'left' }) {
  return (
    <td className={`px-3 py-2 border-t border-border text-text-primary text-${align} whitespace-nowrap`}>
      {children}
    </td>
  );
}