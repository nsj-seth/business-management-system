export function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between mt-3 text-sm text-text-muted">
      <span>
        Showing {startItem}-{endItem} of {totalItems}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 rounded-md border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-panel-bg"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded-md border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-panel-bg"
        >
          Next
        </button>
      </div>
    </div>
  );
}