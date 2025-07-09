"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Delete, Duplicate, Close } from '@vibe/icons'
import { Loader2 } from 'lucide-react'
import SupplierName from "../supplier-name"
import { formatCurrency } from "@/lib/utils"
import { memo } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
    onDuplicate?: (row: any) => void;
    deleteDialogOpen?: boolean;
    setDeleteDialogOpen?: (open: boolean) => void;
    deleteItem?: any;
    setDeleteItem?: (item: any) => void;
    duplicatingItemId?: string | null;
}

// Delete confirmation dialog component
function DeleteConfirmDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    itemName 
}: { 
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    itemName: string;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer l&apos;élément &quot;{itemName}&quot; ? Cette action est irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export const createColumns = ({ 
    selectedRows,
    handleSelectRow, 
    onEdit,
    onDuplicate,
    setDeleteDialogOpen,
    setDeleteItem,
    duplicatingItemId,
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
        cell: ({ row }) => {
            const handleEdit = () => {
                if (onEdit) {
                    onEdit(row.original);
                } else {
                    console.log('Edit:', row.original);
                }
            };

            const handleDuplicate = () => {
                if (onDuplicate) {
                    onDuplicate(row.original);
                } else {
                    console.log('Duplicate:', row.original);
                }
            };

            const isRowDuplicating = duplicatingItemId === row.original.id;
            const hasNoId = !row.original.id;

            const handleDeleteClick = () => {
                if (setDeleteItem && setDeleteDialogOpen) {
                    setDeleteItem(row.original);
                    setDeleteDialogOpen(true);
                }
            };

            return (
                <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEdit}
                        title="Modifier"
                    >
                        <MemoizedEdit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDuplicate}
                        disabled={hasNoId || isRowDuplicating}
                        title={hasNoId ? "Non disponible pour les templates" : "Dupliquer"}
                    >
                        {isRowDuplicating && !hasNoId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MemoizedDuplicate className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteClick}
                        disabled={hasNoId}
                        title={hasNoId ? "Non disponible pour les templates" : "Supprimer"}
                    >
                        <MemoizedDelete className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];

// Export the DeleteConfirmDialog for use in the parent component
export { DeleteConfirmDialog };