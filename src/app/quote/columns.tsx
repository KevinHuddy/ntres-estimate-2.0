import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
    AlertDialog, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogFooter, 
    AlertDialogTitle, 
    AlertDialogDescription 
} from "@/components/ui/alert-dialog";
import { memo } from "react";

// Component for displaying supplier name
const SupplierName = memo(({ supplierName }: { supplierName: string | null }) => {
    return supplierName ? (
        <Badge variant="secondary" className="text-xs">
            {supplierName}
        </Badge>
    ) : null;
});

SupplierName.displayName = "SupplierName";

// Component for select checkbox
const SelectCell = memo(({ row, selectedRows, handleSelectRow }: { 
    row: any, 
    selectedRows: Record<string, boolean>, 
    handleSelectRow: (id: string, checked: boolean) => void 
}) => {
    const isSelected = selectedRows[row.id] || false;
    
    return (
        <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
            aria-label="Select row"
        />
    );
});

SelectCell.displayName = "SelectCell";

// Actions dropdown component
const ActionsDropdown = memo(({ 
    row, 
    onEdit, 
    onDuplicate, 
    setDeleteDialogOpen, 
    setDeleteItem, 
    isDuplicating 
}: { 
    row: any, 
    onEdit: (row: any) => void, 
    onDuplicate: (row: any) => void, 
    setDeleteDialogOpen: (open: boolean) => void, 
    setDeleteItem: (item: any) => void, 
    isDuplicating: (id: string) => boolean 
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                }}>
                    Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(row);
                    }}
                    disabled={isDuplicating(row.id)}
                >
                    {isDuplicating(row.id) ? "Duplication..." : "Dupliquer"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteItem(row);
                        setDeleteDialogOpen(true);
                    }}
                    className="text-red-600"
                >
                    Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

ActionsDropdown.displayName = "ActionsDropdown";

// Delete confirmation dialog
export const DeleteConfirmDialog = memo(({ 
    open, 
    onOpenChange, 
    onConfirm, 
    itemName 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onConfirm: () => void, 
    itemName: string 
}) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer &quot;{itemName}&quot; ? Cette action ne peut pas être annulée.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Supprimer
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
});

DeleteConfirmDialog.displayName = "DeleteConfirmDialog";

// Type for columns configuration
interface ColumnsConfig {
    selectedRows: Record<string, boolean>;
    handleSelectRow: (id: string, checked: boolean) => void;
    onEdit: (row: any) => void;
    onDuplicate: (row: any) => void;
    setDeleteDialogOpen: (open: boolean) => void;
    setDeleteItem: (item: any) => void;
    isDuplicating: (id: string) => boolean;
}

export const createQuoteColumns = ({ 
    selectedRows,
    handleSelectRow, 
    onEdit,
    onDuplicate,
    setDeleteDialogOpen,
    setDeleteItem,
    isDuplicating,
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
        accessorKey: 'qty_quote',
        size: 60,
        header: () => (
            <div className="text-right w-full border-l-1">
                Quantité
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right" title={row.original.qty_quote}>
                {row.original.qty_quote}
            </div>
        )
    },
    {
        accessorKey: 'cost_quote',
        size: 75,
        header: () => (
            <div className="text-right w-full border-l-1">
                Prix
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right" title={row.original.cost_quote}>
                {formatCurrency(row.original.cost_quote)}
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
                {formatCurrency(row.original.cost_quote * row.original.qty_quote)}
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
            />
        ),
    },
]; 