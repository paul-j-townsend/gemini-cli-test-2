import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  emptyMessage = "No data available",
  searchPlaceholder = "Search..."
}: DataTableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initialWidths: Record<string, number> = {};
    columns.forEach(col => {
      const key = String(col.key);
      initialWidths[key] = col.width || 150;
    });
    return initialWidths;
  });
  
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  
  const tableRef = useRef<HTMLTableElement>(null);

  const handleSort = (key: string) => {
    if (!columns.find(col => String(col.key) === key)?.sortable) return;
    
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getValue = (row: T, key: string) => {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    if (searchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      filtered = data.filter(row => 
        searchableColumns.some(col => {
          const value = getValue(row, String(col.key));
          return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    if (sortKey && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = getValue(a, sortKey);
        const bVal = getValue(b, sortKey);
        
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        const result = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? result : -result;
      });
    }

    return filtered;
  }, [data, searchTerm, sortKey, sortDirection, columns]);

  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizing({
      column: columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey] || 150
    });
  }, [columnWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    
    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);
    const column = columns.find(col => String(col.key) === resizing.column);
    
    if (column?.maxWidth && newWidth > column.maxWidth) return;
    if (column?.minWidth && newWidth < column.minWidth) return;
    
    setColumnWidths(prev => ({
      ...prev,
      [resizing.column]: newWidth
    }));
  }, [resizing, columns]);

  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAndSortedData.length} {filteredAndSortedData.length === 1 ? 'item' : 'items'}
          </h3>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {filteredAndSortedData.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500">{searchTerm ? 'No results found for your search.' : emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => {
                  const key = String(column.key);
                  const isActive = sortKey === key;
                  return (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none"
                      style={{ width: columnWidths[key] }}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSort(key)}
                          className={`flex items-center space-x-1 ${
                            column.sortable !== false ? 'hover:text-gray-700 cursor-pointer' : ''
                          }`}
                        >
                          <span>{column.header}</span>
                          {column.sortable !== false && (
                            <div className="flex flex-col">
                              <ChevronUpIcon 
                                className={`h-3 w-3 ${
                                  isActive && sortDirection === 'asc' ? 'text-primary-600' : 'text-gray-400'
                                }`} 
                              />
                              <ChevronDownIcon 
                                className={`h-3 w-3 ${
                                  isActive && sortDirection === 'desc' ? 'text-primary-600' : 'text-gray-400'
                                }`} 
                              />
                            </div>
                          )}
                        </button>
                        <div
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-300 active:bg-primary-400"
                          onMouseDown={(e) => handleMouseDown(e, key)}
                        />
                      </div>
                    </th>
                  );
                })}
                {(onEdit || onDelete) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => {
                    const key = String(column.key);
                    const value = getValue(row, key);
                    return (
                      <td
                        key={key}
                        className="px-4 py-3 text-sm text-gray-900"
                        style={{ width: columnWidths[key] }}
                      >
                        <div className="truncate">
                          {column.render ? column.render(value, row) : String(value || '')}
                        </div>
                      </td>
                    );
                  })}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}