import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Download,
  Inbox
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  accessor?: (row: T) => any;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: (row: T) => string;
  initialSortKey?: string;
  initialSortDirection?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchKey,
  initialSortKey,
  initialSortDirection = 'asc',
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  filterSlot,
  actionSlot,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filter parameters to find what you are looking for.',
  onRowClick,
  exportFileName
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchKey) {
        return searchKey(row).toLowerCase().includes(term);
      }
      return Object.values(row as any).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(term);
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchKey]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const activeColumn = columns.find((c) => c.key === sortKey);
    if (!activeColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = activeColumn.accessor ? activeColumn.accessor(a) : (a as any)[sortKey];
      let valB = activeColumn.accessor ? activeColumn.accessor(b) : (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination Data
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, validPage, pageSize]);

  const handleSort = (columnKey: string) => {
    if (sortKey === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(undefined);
        setSortDirection('asc');
      }
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (!sortedData.length) return;
    const headers = columns.map((c) => (typeof c.header === 'string' ? c.header : c.key));
    const rows = sortedData.map((row) =>
      columns.map((c) => {
        const val = c.accessor ? c.accessor(row) : (row as any)[c.key];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
    );

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName || 'export_data'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="flex flex-1 items-center gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded bg-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Slot */}
          {filterSlot}
        </div>

        {/* Action Slot & Export */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          {exportFileName && (
            <button
              onClick={handleExportCSV}
              disabled={sortedData.length === 0}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black rounded-xl text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Export filtered records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
          {actionSlot}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
            <tr>
              {columns.map((column) => {
                const isSorted = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={`py-3.5 px-4 font-bold ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${column.className || ''}`}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="group inline-flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer"
                      >
                        <span>{column.header}</span>
                        <span className="p-0.5 rounded group-hover:bg-slate-200 transition-colors">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-black" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-black" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: pageSize > 8 ? 8 : pageSize }).map((_, rIdx) => (
                <tr key={`skel_${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skel_cell_${cIdx}`} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-3 text-slate-400">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">{emptyTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowKey = keyExtractor(row);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors duration-150 hover:bg-slate-50/80 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${rowKey}_${col.key}`}
                        className={`py-3.5 px-4 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(row, (validPage - 1) * pageSize + idx)
                          : col.accessor
                          ? col.accessor(row)
                          : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count Footnote */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 pt-1">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-slate-900">
              {totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-900">
              {Math.min(validPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-slate-900">{totalItems}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">|</span>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Switchers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold">
            Page {validPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
