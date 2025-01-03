'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row as TRow,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  Column as TColumn,
  Table as TableInstance,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/tables/table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import TableSkeleton from './TableSkeleton';
import OutlinedIcon from '../icons/outlined-icon';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  enableSorting?: boolean;
  enableFiltering?: boolean;
  defaultValue?: string | number; // Add default value option
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
  totalPages?: number;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  isError?: boolean;
  errorMessage?: string;
}

const FilterInput = React.memo(function FilterInput<T>({
  columnId,
  value,
  onChange,
}: {
  columnId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onChange(inputValue)}
      placeholder="Filter... ⏎"
      className="w-24 px-2 py-1 text-sm rounded bg-[--md-sys-color-surface-container-highest] focus:outline-none focus:ring-2 focus:ring-[--md-sys-color-primary]"
    />
  );
});

const PaginationControls = React.memo(({
  page,
  totalPages,
  onPageChange,
  showPageInput = false,
  disabled = false
}: {
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  showPageInput?: boolean;
  disabled?: boolean;
}) => {
  const [pageInput, setPageInput] = useState(page.toString());

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

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
  };

  return (
    <div className="page-table mt-4 flex justify-between items-center">
      <button
        onClick={handlePreviousPage}
        disabled={disabled || page === 1}
        className="px-4 py-2 bg-[--md-sys-color-surface-variant] rounded-md disabled:opacity-50 flex"
        aria-label='Previous page'
      >
        <OutlinedIcon icon='arrow_back' />
      </button>
      {showPageInput && (
        <div className="flex items-center gap-2">
          <span>Page</span>
          <input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            disabled={disabled}
            className="w-16 px-2 py-1 rounded-md bg-[--md-sys-color-surface-container-highest] disabled:opacity-50"
            min="1"
            max={totalPages}
            aria-label="Page number input"
          />
          {totalPages && <span>of {totalPages}</span>}
        </div>
      )}
      <button
        onClick={handleNextPage}
        disabled={disabled || (totalPages ? page >= totalPages : false)}
        className="px-4 py-2 bg-[--md-sys-color-surface-variant] rounded-md disabled:opacity-50 flex"
        aria-label='Next page'
      >
        <OutlinedIcon icon="arrow_forward" />
      </button>
    </div>
  );
});

PaginationControls.displayName = 'PaginationControls';

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
  enableSelection = false,
  onSelectionChange,
  isError = false,
  errorMessage = 'An error occurred while loading data.',
}: PaginationTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns: useMemo(() => {
      const baseColumns: ColumnDef<T>[] = columns.map((col) => ({
        id: String(col.header),
        header: ({ column }: { column: TColumn<T> }) => (
          <div className="flex items-center gap-2 px-2">
            <button
              onClick={() => col.enableSorting !== false && column.toggleSorting()}
              className={`${col.enableSorting === false ? 'cursor-default' : 'cursor-pointer'} flex items-center gap-1 whitespace-nowrap`}
            >
              {col.header}
              {col.enableSorting !== false && (
                <span>
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </button>
            {col.enableFiltering !== false && (
              <FilterInput
                columnId={String(col.header)}
                value={(column.getFilterValue() as string) || ''}
                onChange={(value) => column.setFilterValue(value)}
              />
            )}
          </div>
        ),
        accessorFn: (row) => {
          try {
            const value = typeof col.accessor === "function"
              ? col.accessor(row)
              : row[col.accessor as keyof T];
            
            // Handle null/undefined values
            if (value === null || value === undefined) {
              return col.defaultValue || '';
            }
            
            return String(value);
          } catch (error) {
            console.warn(`Error accessing property ${String(col.accessor)}:`, error);
            return col.defaultValue || '';
          }
        },
        cell: ({ row }) => {
          try {
            const value = typeof col.accessor === "function"
              ? col.accessor(row.original)
              : row.original[col.accessor as keyof T];
            
            // Handle null/undefined values
            if (value === null || value === undefined) {
              return <div className="px-2">{col.defaultValue || ''}</div>;
            }
            
            return <div className="px-2">{String(value)}</div>;
          } catch (error) {
            console.warn(`Error rendering cell for ${String(col.accessor)}:`, error);
            return <div className="px-2">{col.defaultValue || ''}</div>;
          }
        },
        enableSorting: col.enableSorting !== false,
        enableColumnFilter: col.enableFiltering !== false,
      }));

      if (enableSelection) {
        baseColumns.unshift({
          id: 'select',
          header: ({ table }: { table: TableInstance<T> }) => (
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="w-4 h-4"
              aria-label="Select all"
            />
          ),
          cell: ({ row }: { row: TRow<T> }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => {
                e.stopPropagation();
                row.toggleSelected();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4"
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableColumnFilter: false,
        });
      }

      if (rowActions) {
        baseColumns.push({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }: { row: TRow<T> }) => (
            <div onClick={(e) => e.stopPropagation()}>
              {rowActions(row.original)}
            </div>
          ),
          enableSorting: false,
          enableColumnFilter: false,
        });
      }

      return baseColumns;
    }, [columns, enableSelection, rowActions]),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    manualPagination: true,
    pageCount: totalPages || -1,
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onSelectionChange]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto min-h-[300px] relative scrollbar-hide hover:scrollbar-default">
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              width: 4px;
              height: 4px;
              display: none;
            }
            
            .scrollbar-hide:hover::-webkit-scrollbar {
              display: block;
            }

            .scrollbar-hide::-webkit-scrollbar-track {
              background: transparent;
            }

            .scrollbar-hide::-webkit-scrollbar-thumb {
              background: var(--md-sys-color-outline-variant);
              border-radius: 2px;
            }

            .scrollbar-hide::-webkit-scrollbar-button {
              display: none;
            }

            .scrollbar-hide {
              scrollbar-width: thin;
              scrollbar-color: var(--md-sys-color-outline-variant) transparent;
            }
          `}</style>
          {isLoading && (
            <div className="absolute inset-0 bg-[--md-sys-color-surface] bg-opacity-50 z-20">
              <TableSkeleton
                columns={table.getAllColumns().length}
                rows={data.length || 10}
              />
            </div>
          )}
          {isError ? (
            <div className="text-center py-8 text-[--md-sys-color-error]">
              {errorMessage}
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-[--md-sys-color-surface-container] z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="first:pl-2 last:pr-2"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      onClick={() => onRowClick?.(row.original)}
                      className={`
                        ${index % 2 === 0 ? 'bg-[--md-sys-color-surface]' : 'bg-[--md-sys-color-surface-container-highest]'}
                        ${onRowClick ? 'cursor-pointer hover:bg-[--md-sys-color-surface-variant]' : ''}
                        transition-colors
                      `}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="first:pl-2 last:pr-2"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showPageInput={showPageInput}
        disabled={isError} // Only disable on error, not on loading
      />
    </div>
  );
}
