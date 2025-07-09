"use client";

import { ColumnDef, SortDirection, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useCallback, memo } from "react";

// Memoize the SortingIndicator to prevent unnecessary re-renders
const SortingIndicator = memo(({ isSorted }: { isSorted: SortDirection | false }) => {
  if (!isSorted) return null;
  return (
    <div>
      {
        {
          asc: "↑",
          desc: "↓",
        }[isSorted]
      }
    </div>
  );
});

SortingIndicator.displayName = "SortingIndicator";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  // Memoize the row click handler to prevent recreating on each render
  const handleRowClick = useCallback((row: TData, e: React.MouseEvent) => {
    // Prevent clicks on buttons/inputs from triggering row click
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="button"]')) {
      return;
    }
    onRowClick?.(row);
  }, [onRowClick]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      minWidth: header.column.columnDef.size,
                      maxWidth: header.column.columnDef.size,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className="flex items-center"
                        {...{
                          style: header.column.getCanSort()
                            ? {
                                cursor: "pointer",
                                userSelect: "none",
                              }
                            : {},
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <SortingIndicator
                          isSorted={header.column.getIsSorted()}
                        />
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            // Check if the row has no ID or starts with "temp-" (optimistic updates)
            const isTemporaryRow = !((row.original as any)?.id) || ((row.original as any)?.id as string)?.startsWith('temp-');
            
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={`${onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} ${isTemporaryRow ? "opacity-80" : ""}`}
                onClick={onRowClick ? (e) => handleRowClick(row.original, e) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id} 
                    style={{
                      minWidth: cell.column.columnDef.size,
                      maxWidth: cell.column.columnDef.size,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Memoize the entire DataTable component to prevent unnecessary re-renders
export const MemoizedDataTable = memo(DataTable) as typeof DataTable;