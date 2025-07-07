"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Delete, Duplicate, Close } from '@vibe/icons'
import SupplierName from "../supplier-name"

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
                    <Close className="h-4 w-4 text-muted-foreground/40" />
                )}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => row.original.name
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => row.original.type
    },
    {
        accessorKey: 'unit_type',
        header: 'Unité',
        cell: ({ row }) => row.original.unit_type
    },
    {
        accessorKey: 'qty_takeoff',
        header: 'Quantité',
        cell: ({ row }) => row.original.qty_takeoff
    },
    {
        accessorKey: 'price_takeoff',
        header: 'Prix unitaire',
        cell: ({ row }) => row.original.price_takeoff
    },
    {
        accessorKey: 'linked_supplier',
        header: 'Fournisseur',
        cell: ({ row }) => <SupplierName supplierId={row.original.linked_supplier} />
    },
    {
        id: 'actions',
        header: 'Actions',
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
                    <Edit className="h-4 w-4" />
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
                    <Duplicate className="h-4 w-4" />
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
                    <Delete className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];