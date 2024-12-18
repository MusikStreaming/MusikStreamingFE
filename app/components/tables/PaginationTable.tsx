'use client';

import { useState, useEffect, use } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface PaginationTableProps<T> {
  data: T[];
  columns: Column<T>[];
  page: number;
  onPageChange: (page: number) => void;
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => React.ReactNode;
  isLoading?: boolean;
  showPageInput?: boolean;
  totalPages?: number; // Add this prop
}

export default function PaginationTable<T>({
  data,
  columns,
  page,
  onPageChange,
  onRowClick,
  rowActions,
  isLoading,
  showPageInput = false,
  totalPages,
}: PaginationTableProps<T>) {
  const [pageInput, setPageInput] = useState(page.toString());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setIsScrolled(target.scrollTop > 0);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInput);
      if (!isNaN(newPage) && newPage > 0 && (!totalPages || newPage <= totalPages)) {
        onPageChange(newPage);
      }
    }
  };

  const handlePreviousPage = () => {
    const newPage = Math.max(1, page - 1);
    onPageChange(newPage);
  };

  const handleNextPage = () => {
    if (!totalPages || page < totalPages) {
      onPageChange(page + 1);
    }
  }

  const paginationControls = (
    <div className="mt-4 flex justify-between items-center">
      <button
        onClick={handlePreviousPage}
        disabled={page === 1}
        className="px-4 py-2 bg-[--md-sys-color-surface-variant] rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      
      {showPageInput && (
        <div className="flex items-center gap-2">
          <span>Page</span>
          <input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            className="w-16 px-2 py-1 rounded-md bg-[--md-sys-color-surface-container-highest]"
            min="1"
            max={totalPages}
            aria-label='Page number input'
          />
          {totalPages && <span>of {totalPages}</span>}
        </div>
      )}

      <button
        onClick={handleNextPage}
        disabled={totalPages ? page >= totalPages : false}
        className="px-4 py-2 bg-[--md-sys-color-surface-variant] rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  const tableContent = (
    <div className="overflow-x-auto max-h-96 overflow-y-auto" onScroll={handleScroll}>
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          Loading...
        </div>
      ) : (
        <table className="min-w-full divide-y divide-[--md-sys-color-outline] relative">
          <thead className="sticky top-0 z-10">
            <tr className={`transition-colors duration-200 ${
              isScrolled ? 'bg-[--md-sys-color-surface-container]' : 'bg-transparent'
            }`}>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 text-left">
                  {column.header}
                </th>
              ))}
              {rowActions && <th className="px-6 py-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody className="relative">
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-[--md-sys-color-surface-variant]' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : String(item[column.accessor])}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-6 py-4">{rowActions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      {tableContent}
      {paginationControls}
    </div>
  );
}