"use client";

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const pageNums = getPageNumbers(page, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination__info">
        Showing <strong>{from}–{to}</strong> of <strong>{total.toLocaleString('en-US')}</strong> employees
      </span>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          aria-label="Previous"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>

        {pageNums.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: 'var(--color-text-3)', fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination__btn"
          aria-label="Next"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>

      <div className="pagination__size">
        <span>Rows per page</span>
        <select
          id="page-size"
          aria-label="Page Size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
