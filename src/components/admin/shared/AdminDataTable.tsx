import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';

export interface TableColumn<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  disabled?: (item: T) => boolean;
  icon?: React.ReactNode;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  onAdd?: () => void;
  addButtonLabel?: string;
  className?: string;
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
}

export const AdminDataTable = React.memo(<T extends { id: string }>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = 'No items found',
  title,
  onAdd,
  addButtonLabel = 'Add New',
  className = '',
  itemsPerPage = 10,
  onRowClick,
}: AdminDataTableProps<T>) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => 
    sortedData.slice(startIndex, endIndex), 
    [sortedData, startIndex, endIndex]
  );

  const handleSort = useCallback((column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  const renderCellContent = useCallback((item: T, column: TableColumn<T>) => {
    if (column.key === 'actions') {
      return (
        <div className="flex space-x-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'ghost'}
              size="sm"
              onClick={() => action.onClick(item)}
              disabled={action.disabled ? action.disabled(item) : false}
              className="text-sm"
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      );
    }

    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key as keyof T];
    return typeof value === 'string' || typeof value === 'number' ? value : '';
  }, [actions]);

  if (loading) {
    return (
      <Card className={className}>
        <LoadingState message="Loading data..." />
      </Card>
    );
  }

  return (
    <Card 
      title={title}
      className={className}
      actions={
        onAdd ? (
          <Button onClick={onAdd} variant="primary" size="sm">
            {addButtonLabel}
          </Button>
        ) : undefined
      }
    >
        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="text-center py-12">
            <div className="text-emerald-400 text-lg mb-2">📋</div>
            <p className="text-emerald-600 text-sm">{emptyMessage}</p>
          </div>
        )}

        {/* Table */}
        {!loading && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-200">
              <thead className="bg-emerald-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={`px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider ${
                        column.sortable ? 'cursor-pointer select-none' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key as keyof T)}
                    >
                      <div className="flex items-center space-x-1 hover:text-emerald-700 group">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="text-emerald-400 group-hover:text-emerald-600">
                            {sortColumn === column.key ? (
                              sortDirection === 'asc' ? '↑' : '↓'
                            ) : (
                              '↕'
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-200">
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-emerald-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                        {column.key === 'actions' ? (
                          <div className="flex space-x-2">
                            {actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || 'ghost'}
                                size="sm"
                                onClick={() => action.onClick(item)}
                                disabled={action.disabled ? action.disabled(item) : false}
                                className="text-sm"
                              >
                                {action.icon && <span className="mr-1">{action.icon}</span>}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          column.render ? column.render(item) : String(item[column.key as keyof T])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-emerald-50 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-emerald-700">
                Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={useCallback(() => setCurrentPage(Math.max(1, currentPage - 1)), [currentPage])}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={useCallback(() => setCurrentPage(page), [page])}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={useCallback(() => setCurrentPage(Math.min(totalPages, currentPage + 1)), [totalPages, currentPage])}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
    </Card>
  );
}) as <T extends { id: string }>(props: AdminDataTableProps<T>) => JSX.Element;

// AdminDataTable.displayName = 'AdminDataTable';

export default AdminDataTable;