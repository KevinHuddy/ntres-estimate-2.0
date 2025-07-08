"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Delete, Duplicate, Close } from '@vibe/icons'
import SupplierName from "../supplier-name"
import { formatCurrency } from "@/lib/utils"
import { memo } from "react"

// Memoized icon components to reduce SVG rendering overhead
const MemoizedEdit = memo(Edit);
const MemoizedDelete = memo(Delete);
const MemoizedDuplicate = memo(Duplicate);
const MemoizedClose = memo(Close);

interface ColumnsConfig {
    selectedRows: Record<string, boolean>;
    handleSelectRow: (id: string, checked: boolean) => void;
    onEdit?: (row: any) => void;
    onDelete?: (id: string) => void;
    // onDuplicate?: (row: any) => void;
    // type?: 'product' | 'mo'
}

export const createColumns = ({ 
    selectedRows,
    handleSelectRow, 
    onEdit,
    onDelete,
    // onDuplicate,
    // type = 'product'
}: ColumnsConfig): ColumnDef<any>[] => [
    {
        id: 'select',
        size: 20,
        enableResizing: false,
        cell: ({ row }) => (
            <div onClick={(e) => e.stopPropagation()}>
                { !!row.original.id ? (
                    <Checkbox
                        checked={selectedRows[row.original.id] || false}
                        onCheckedChange={(value) =>
                            handleSelectRow(row.original.id, !!value)
                        }
                        aria-label="Select row"
                        />
                ) : (
                    <MemoizedClose className="h-4 w-4 text-muted-foreground/40" />
                )}
            </div>
        )
    },
    {
        accessorKey: 'name',
        header: 'Nom',
        size: 300,
        minSize: 200,
        maxSize: 500,
        cell: ({ row }) => (
            <div className="truncate pr-2" title={row.original.name}>
                {row.original.name}
            </div>
        )
    },
    {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
        cell: ({ row }) => (
            <div className="truncate pr-2" title={row.original.type}>
                {row.original.type}
            </div>
        )
    },
    {
        accessorKey: 'unit_type',
        header: 'Unité',
        size: 100,
        minSize: 80,
        maxSize: 150,
        cell: ({ row }) => (
            <div className="truncate pr-2" title={row.original.unit_type}>
                {row.original.unit_type}
            </div>
        )
    },
    {
        accessorKey: 'qty_takeoff',
        // header: 'Quantité',
        size: 60,
        header: () => (
            <div className="text-right w-full border-l-1">
                Quantité
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right" title={row.original.qty_takeoff}>
                {row.original.qty_takeoff}
            </div>
        )
    },
    {
        accessorKey: 'cost_takeoff',
        size: 80,
        header: () => (
            <div className="text-right w-full border-l-1">
                Prix
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right" title={row.original.cost_takeoff}>
                {formatCurrency(row.original.cost_takeoff)}
            </div>
        )
    },
    {
        accessorKey: 'total',
        size: 100,
        header: () => (
            <div className="text-right w-full border-l-1">
                Total
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right">
                {formatCurrency(row.original.cost_takeoff * row.original.qty_takeoff)}
            </div>
        )
    },
    {
        accessorKey: 'linked_supplier',
        header: 'Fournisseur',
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => (
            <div className="truncate pr-2">
                <SupplierName supplierName={row.original.supplierName} />
            </div>
        )
    },
    {
        id: 'actions',
        header: () => (
            <div className="w-full">
                Actions
            </div>
        ),
        size: 100,
        cell: ({ row }) => (
            <div
                className="flex gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        if (onEdit) {
                            onEdit(row.original);
                        } else {
                            console.log('View user details:', row.original);
                        }
                    }}
                >
                    <MemoizedEdit className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        if (onEdit) {
                            onEdit(row.original);
                        } else {
                            console.log('View user details:', row.original);
                        }
                    }}
                >
                    <MemoizedDuplicate className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                        if (onDelete) {
                            onDelete(row.original.id);
                        } else {
                            console.log('Delete user:', row.original.id);
                        }
                    }}
                >
                    <MemoizedDelete className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];