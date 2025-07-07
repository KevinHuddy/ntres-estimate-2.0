import { type Cell, type Row, flexRender } from "@tanstack/react-table"
import React, { useState } from "react"

import { TableCell as TableCellBase, TableRow, TableBody as TableBodyBase } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"
import { useTableContext } from "../table-content"
import { cn } from "@/lib/utils"
import { getAlignment } from "../utils"
import { TableRowEditor } from "./row-editor"

interface TableBodyProps {
    customRowStyles?: (row: Row<any>) => string
}

export function TableBody({ customRowStyles }: TableBodyProps) {
    const [editingRowId, setEditingRowId] = useState<string | null>(null)

    const { table, updateData, enableEditing } = useTableContext()

    const handleEdit = (row: Row<any>) => {
        setEditingRowId(row.id)
    }

    const handleSave = (rowIndex: number, updatedData: any) => {
        updateData(rowIndex, updatedData)
        setEditingRowId(null)
    }

    const handleCancel = () => {
        setEditingRowId(null)
    }

    const renderRow = (row: Row<any>) => {
        const rowStyle = customRowStyles ? customRowStyles(row) : ""
        const depth = row.depth || 0

        if (editingRowId === row.id) {
            return (
                <TableRow key={row.id} className="bg-muted/50">
                    <TableRowEditor row={row} onSave={handleSave} onCancel={handleCancel} />
                </TableRow>
            )
        }

        return (
            <React.Fragment key={row.id}>
                <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(rowStyle, "hover:bg-muted/50 transition-colors")}
                >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCellBase
                            key={cell.id}
                            style={{ width: cell.column.getSize() }}
                            className={cn(getAlignment(cell.column.columnDef.meta?.align), "py-3 px-4")}
                        >
                            <TableCell 
                                cell={cell}
                                cellIndex={cellIndex}
                                depth={depth}
                                handleEdit={handleEdit}
                                enableEditing={enableEditing}
                                row={row}
                            />
                        </TableCellBase>
                    ))}
                </TableRow>
            </React.Fragment>
        )
    }

    return (
        <TableBodyBase>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => renderRow(row))
            ) : (
                <TableRow>
                    <TableCellBase colSpan={table.getAllColumns().length} className="h-24 text-center">
                        No results.
                    </TableCellBase>
                </TableRow>
            )}
        </TableBodyBase>
    )
}

interface TableCellProps {
    cell: Cell<any, any>
    cellIndex: number
    depth: number
    handleEdit: (row: Row<any>) => void
    enableEditing: boolean | undefined
    row: Row<any>
}

export function TableCell({ cell, cellIndex, depth, handleEdit, enableEditing, row }: TableCellProps) {
    return (
      <>
        {cellIndex === 0 ? (
          <div className="flex items-center" style={{ paddingLeft: `${depth * 2}rem` }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
  
            {enableEditing && (
              <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          flexRender(cell.column.columnDef.cell, cell.getContext())
        )}
      </>
    )
  }
  