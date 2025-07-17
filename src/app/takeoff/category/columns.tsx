"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Delete, Duplicate, Close } from '@vibe/icons'
import { Loader2, MoreHorizontal } from 'lucide-react'
import SupplierName from "../supplier-name"
import { formatCurrency } from "@/lib/utils"
import { memo, useCallback } from "react"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    isDuplicating?: (itemId: string) => boolean;
    disabled?: boolean;
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

// Memoized dropdown actions component to prevent unnecessary re-renders
const ActionsDropdown = memo(({ 
    row, 
    onEdit, 
    onDuplicate, 
    setDeleteDialogOpen, 
    setDeleteItem, 
    isDuplicating,
    disabled 
}: {
    row: any;
    onEdit?: (row: any) => void;
    onDuplicate?: (row: any) => void;
    setDeleteDialogOpen?: (open: boolean) => void;
    setDeleteItem?: (item: any) => void;
    isDuplicating?: (itemId: string) => boolean;
    disabled?: boolean;
}) => {
    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onEdit) {
            onEdit(row);
        } else {
            console.log('Edit:', row);
        }
    }, [onEdit, row]);

    const handleDuplicate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onDuplicate) {
            onDuplicate(row);
        } else {
            console.log('Duplicate:', row);
        }
    }, [onDuplicate, row]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (setDeleteItem && setDeleteDialogOpen) {
            setDeleteItem(row);
            setDeleteDialogOpen(true);
        }
    }, [setDeleteItem, setDeleteDialogOpen, row]);

    const isRowDuplicating = isDuplicating ? isDuplicating(row.id) : false;
    const hasNoId = !row.id;

    return (
        <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={isRowDuplicating || disabled}
                    >
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={handleEdit}
                        disabled={isRowDuplicating}
                        className="cursor-pointer"
                    >
                        <MemoizedEdit className="mr-2 h-4 w-4" />
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDuplicate}
                        disabled={hasNoId || isRowDuplicating}
                        className="cursor-pointer"
                    >
                        {isRowDuplicating && !hasNoId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <MemoizedDuplicate className="mr-2 h-4 w-4" />
                        )}
                        Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDeleteClick}
                        disabled={hasNoId || isRowDuplicating}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <MemoizedDelete className="mr-2 h-4 w-4" />
                        Supprimer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
});

ActionsDropdown.displayName = "ActionsDropdown";

// Memoized checkbox component
const SelectCell = memo(({ row, selectedRows, handleSelectRow, disabled }: {
    row: any;
    selectedRows: Record<string, boolean>;
    handleSelectRow: (id: string, checked: boolean) => void;
    disabled?: boolean;
}) => {
    const handleCheckboxChange = useCallback((value: boolean) => {
        handleSelectRow(row.original.id, value);
    }, [handleSelectRow, row.original.id]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <div onClick={handleClick}>
            {!!row.original.id ? (
                <Checkbox
                    checked={selectedRows[row.original.id] || false}
                    onCheckedChange={handleCheckboxChange}
                    aria-label="Select row"
                    disabled={disabled}
                />
            ) : (
                <MemoizedClose className="h-4 w-4 text-muted-foreground/40" />
            )}
        </div>
    );
});

SelectCell.displayName = "SelectCell";

export const createColumns = ({ 
    selectedRows,
    handleSelectRow, 
    onEdit,
    onDuplicate,
    setDeleteDialogOpen,
    setDeleteItem,
    isDuplicating,
    disabled,
}: ColumnsConfig): ColumnDef<any>[] => [
    {
        id: 'select',
        size: 20,
        enableResizing: false,
        cell: ({ row }) => (
            <SelectCell
                row={row}
                selectedRows={selectedRows}
                handleSelectRow={handleSelectRow}
                disabled={disabled}
            />
        )
    },
    {
        accessorKey: 'name',
        header: 'Nom',
        size: 200,
        cell: ({ row }) => (
            <div className="truncate pr-2" title={row.original.name}>
                {row.original.name}
            </div>
        )
    },
    {
        accessorKey: 'type',
        header: () => (
            <div className="w-full relative after:absolute after:left--1 after:top-0 after:w-px after:h-full after:bg-border">
                Type
            </div>
        ),
        size: 120,
        cell: ({ row }) => (
            <div className="truncate pr-2 " title={row.original.type}>
                {row.original.type}
            </div>
        )
    },
    {
        accessorKey: 'unit_type',
        header: () => (
            <div className="text-right w-full border-l-1">
                Unité
            </div>
        ),
        size: 60,
        cell: ({ row }) => (
            <div className="truncate pr-2 border-l-1" title={row.original.unit_type}>
                {row.original.unit_type}
            </div>
        )
    },
    {
        accessorKey: 'qty_takeoff',
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
        size: 75,
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
        size: 90,
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
        size: 125,
        cell: ({ row }) => (
            <div className="truncate pr-2">
                <SupplierName supplierName={row.original.supplierName} />
            </div>
        )
    },
    {
        id: 'actions',
        header: () => null,
        size: 30,
        cell: ({ row }) => (
            <ActionsDropdown
                row={row.original}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                setDeleteDialogOpen={setDeleteDialogOpen}
                setDeleteItem={setDeleteItem}
                isDuplicating={isDuplicating}
                disabled={disabled}
            />
        ),
    },
];

// Export the DeleteConfirmDialog for use in the parent component
export { DeleteConfirmDialog };