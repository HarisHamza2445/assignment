import { Pagination } from 'react-bootstrap';

// Shows at most 5 page numbers around the current one
function getPageNumbers(page, totalPages) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

function AppPagination({ pagination, itemLabel = 'items', onPageChange }) {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="list-footer">
      <span className="list-footer__summary">
        Showing {from}-{to} of {total} {itemLabel}
      </span>
      {totalPages > 1 && (
        <Pagination size="sm" className="mb-0">
          <Pagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
          {getPageNumbers(page, totalPages).map((number) => (
            <Pagination.Item key={number} active={number === page} onClick={() => onPageChange(number)}>
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
        </Pagination>
      )}
    </div>
  );
}

export default AppPagination;
