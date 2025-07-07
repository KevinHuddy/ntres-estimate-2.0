import { Checkbox } from "@/components/ui/checkbox";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { TableProvider } from "./table-content";
import { filterRows } from "./filters/utils";
import type { TableRootProps } from "./types.d";

export function TableRoot<TData, TValue>({
  data,
  columns,
  enableSelection,
  enableEditing,
  children,
}: TableRootProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [tableData, setTableData] = React.useState(data);

  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  const updateData = (rowIndex: number, updatedData: TData) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = updatedData;
      return newData;
    });
  };

  const memoColumns = React.useMemo(() => {
    let newColumns = [...columns];

    if (enableSelection) {
      newColumns = [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<TData, unknown>,
        ...newColumns,
      ];
    }

    return newColumns;
  }, [columns, enableSelection]);

  const table = useReactTable({
    data: tableData,
    columns: memoColumns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row: any) => row.subRows,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      pagination,
      expanded
    },
    filterFns: {
      filterRows: filterRows,
    },
  });

  return (
    <TableProvider
      table={table}
      updateData={updateData}
      enableEditing={enableEditing}
    >
      <div className="space-y-4">{children}</div>
    </TableProvider>
  );
}