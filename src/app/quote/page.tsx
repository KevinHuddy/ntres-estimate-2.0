'use client';

import { useMonday } from '@/components/monday-context-provider';
import { useLineItemsByQuote } from '@/hooks/queries';
import { useSuppliers } from '@/hooks/queries/use-suppliers';
import { useProducts } from '@/hooks/queries/use-products';
import { useDeleteLineItemFromQuoteMutation, useCreateLineItemsForQuoteMutation } from '@/hooks/mutations/use-line-items';
import { Loading } from '@/components/loading';
import { DataTable } from '@/app/takeoff/data-table';
import { createQuoteColumns, DeleteConfirmDialog } from './columns';
import QuoteEditModal from './edit-modal';
import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Header from '@/components/header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatCurrency, getBoardSettings } from '@/lib/utils';

export default function Quote() {
    const { context, settings } = useMonday();
    const itemId = context?.itemId;
    
    // Fetch line items for this quote
    const { data: lineItems, isLoading: lineItemsLoading } = useLineItemsByQuote(itemId);
    
    // Fetch suppliers for displaying supplier names
    const { data: suppliers } = useSuppliers();
    
    // Fetch products for product selection
    const { data: products } = useProducts();
    
    // Mutations
    const deleteLineItemMutation = useDeleteLineItemFromQuoteMutation();
    const createLineItemMutation = useCreateLineItemsForQuoteMutation();
    
    // Selection state management
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    
    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<any>(null);
    
    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    
    // Category filter state
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    // Product selection state
    const [productSelectOpen, setProductSelectOpen] = useState(false);
    
    // Create supplier name map for performance
    const supplierNameMap = useMemo(() => {
        if (!suppliers) return {};
        return Object.fromEntries(
            suppliers.map((supplier: any) => [supplier.id, supplier.name])
        );
    }, [suppliers]);
    
    // Enrich line items with supplier names
    const enrichedLineItems = useMemo(() => {
        if (!lineItems) return [];
        return lineItems.map((item: any) => ({
            ...item,
            qty_quote: item.qty_quote || item.qty_takeoff || 0,
            cost_quote: item.cost_quote || item.cost_takeoff || 0,
            supplierName: item.linked_supplier ? supplierNameMap[item.linked_supplier] : null
        }));
    }, [lineItems, supplierNameMap]);
    
    // Get available categories for filter
    const availableCategories = useMemo(() => {
        if (!enrichedLineItems) return [];
        const categories = [...new Set(enrichedLineItems.map((item: any) => item.category || 'Non catégorisé'))];
        return categories.sort();
    }, [enrichedLineItems]);

    // Filter items by selected category
    const filteredItems = useMemo(() => {
        if (!enrichedLineItems) return [];
        if (selectedCategory === 'all') return enrichedLineItems;
        return enrichedLineItems.filter((item: any) => {
            const category = item.category || 'Non catégorisé';
            return category === selectedCategory;
        });
    }, [enrichedLineItems, selectedCategory]);

    // Group filtered items by category
    const categorizedItems = useMemo(() => {
        if (!filteredItems) return [];
        
        const grouped = filteredItems.reduce((acc: any, item: any) => {
            const category = item.category || 'Non catégorisé';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
        
        return Object.entries(grouped).map(([category, items]) => ({
            category,
            items: items as any[]
        }));
    }, [filteredItems]);
    
    // Calculate totals by category
    const categoryTotals = useMemo(() => {
        if (!enrichedLineItems) return {};
        
        return enrichedLineItems.reduce((acc: any, item: any) => {
            const category = item.category || 'Non catégorisé';
            const total = (item.qty_quote || 0) * (item.cost_quote || 0);
            acc[category] = (acc[category] || 0) + total;
            return acc;
        }, {});
    }, [enrichedLineItems]);
    
    // Calculate grand total
    const grandTotal = useMemo(() => {
        return Object.values(categoryTotals).reduce((sum: number, total: any) => sum + (total as number), 0);
    }, [categoryTotals]);
    
    // Handle row selection
    const handleSelectRow = useCallback((id: string, checked: boolean) => {
        setSelectedRows(prev => ({ ...prev, [id]: checked }));
    }, []);
    
    // Handle edit
    const handleEdit = useCallback((row: any) => {
        setSelectedItem(row);
        setEditModalOpen(true);
    }, []);
    
    // Handle duplicate
    const handleDuplicate = useCallback(async (row: any) => {
        try {
            const duplicateName = `${row.name} (Copie)`;
            
            // Get proper column IDs from settings
            const { cols } = getBoardSettings(settings, "LINE_ITEMS");
            const columns = {
                [cols.CATEGORY]: row.category || '',
                [cols.TYPE]: row.type || '',
                [cols.UNIT_TYPE]: row.unit_type || '',
                [cols.QTY_QUOTE]: (row.qty_quote || 0).toString(),
                [cols.COST_QUOTE]: (row.cost_quote || 0).toString(),
                [cols.LINKED_SUPPLIER]: row.linked_supplier || '',
            };

            await createLineItemMutation.mutateAsync({
                name: duplicateName,
                columns,
                quoteId: itemId || '',
            });
            
            toast.success(`"${duplicateName}" a été créé avec succès`);
        } catch (error) {
            console.error('Error duplicating line item:', error);
            toast.error('Erreur lors de la duplication');
        }
    }, [createLineItemMutation, itemId, settings]);
    
    // Handle delete
    const handleDelete = useCallback(async (id: string) => {
        try {
            // Check if the item has takeoff data by looking for linked_takeoff field
            const itemToDelete = enrichedLineItems?.find(item => item.id === id);
            const hasTakeoffData = !!(itemToDelete?.linked_takeoff);

            await deleteLineItemMutation.mutateAsync({
                id,
                quoteId: itemId || '', // Using itemId as the quote ID
                hasTakeoffData,
            });
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        } catch (error) {
            console.error('Error deleting line item:', error);
            toast.error('Erreur lors de la suppression');
        }
    }, [deleteLineItemMutation, itemId, enrichedLineItems]);
    
    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(() => {
        if (deleteItem) {
            handleDelete(deleteItem.id);
        }
    }, [deleteItem, handleDelete]);
    
    // Dialog handlers
    const handleSetDeleteDialogOpen = useCallback((open: boolean) => {
        setDeleteDialogOpen(open);
    }, []);
    
    const handleSetDeleteItem = useCallback((item: any) => {
        setDeleteItem(item);
    }, []);
    
    // Check if an item is duplicating (placeholder)
    const isDuplicating = useCallback(() => {
        return false; // TODO: Implement if needed
    }, []);
    
    // Handle row click to open edit modal
    const handleRowClick = useCallback((row: any) => {
        setSelectedItem(row);
        setEditModalOpen(true);
    }, []);
    
    // Handle product selection and open edit modal with pre-filled data
    const handleProductSelect = useCallback((product: any) => {
        // Create a new item with product data pre-filled for quote
        const newItem = {
            id: null, // New item
            name: product.name,
            category: product.category || 'Non catégorisé',
            type: product.type || '',
            unit_type: product.unit_type || '',
            cost_quote: product.cost || 0,
            linked_supplier: product.linked_supplier?.[0] || '',
            qty_quote: 0,
        };
        
        setSelectedItem(newItem);
        setEditModalOpen(true);
        setProductSelectOpen(false);
    }, []);

    // Handle add item without product selection
    const handleAddItem = useCallback(() => {
        // Create a new empty item for quote
        const newItem = {
            id: null, // New item
            name: '',
            category: selectedCategory === 'all' ? 'Non catégorisé' : selectedCategory,
            type: '',
            unit_type: '',
            cost_quote: 0,
            linked_supplier: '',
            qty_quote: 0,
            linked_quote: itemId,
        };
        
        setSelectedItem(newItem);
        setEditModalOpen(true);
        setProductSelectOpen(false);
    }, [selectedCategory, itemId]);

    // Create columns
    const columns = useMemo(
        () =>
            createQuoteColumns({
                selectedRows,
                handleSelectRow,
                onEdit: handleEdit,
                onDuplicate: handleDuplicate,
                setDeleteDialogOpen: handleSetDeleteDialogOpen,
                setDeleteItem: handleSetDeleteItem,
                isDuplicating,
            }),
        [selectedRows, handleSelectRow, handleEdit, handleDuplicate, handleSetDeleteDialogOpen, handleSetDeleteItem, isDuplicating]
    );
    
    if (lineItemsLoading) {
        return <Loading text="Chargement des éléments du devis" />;
    }
    
    return (
        <>
            <Header>
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">
                        {formatCurrency(Number(grandTotal))}
                    </div>
                </div>
            </Header>
            
            <div className="space-y-6">
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Toutes les catégories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les catégories</SelectItem>
                                {availableCategories.map((category: string) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Popover open={productSelectOpen} onOpenChange={setProductSelectOpen}>
                            <PopoverTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4" />
                                    Ajouter un produit
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                                <Command>
                                    <CommandInput placeholder="Rechercher un produit..." />
                                    <CommandEmpty>
                                        <div className="p-4 text-center">
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Aucun produit trouvé.
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={handleAddItem}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Créer un élément vide
                                            </Button>
                                        </div>
                                    </CommandEmpty>
                                    <CommandList className="max-h-[300px]">
                                        {products?.map((product: any) => (
                                            <CommandItem
                                                key={product.id}
                                                value={`${product.name} ${product.category} ${product.type}`}
                                                onSelect={() => handleProductSelect(product)}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex flex-col gap-1 w-full">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {product.category} • {product.type} • {formatCurrency(product.cost || 0)}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                        {products?.length > 0 && (
                                            <CommandItem
                                                value="empty-item"
                                                onSelect={handleAddItem}
                                                className="cursor-pointer border-t"
                                            >
                                                <div className="flex items-center gap-2 w-full text-muted-foreground">
                                                    <Plus className="w-4 h-4" />
                                                    <span>Créer un élément vide</span>
                                                </div>
                                            </CommandItem>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Category breakdown */}
                {categorizedItems.length > 0 && (
                    <div className="space-y-6">
                        {categorizedItems.map(({ category, items }) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-medium">{category}</h3>
                                    <div className="text-sm text-muted-foreground">
                                        {items.length} élément(s) • Total: {formatCurrency(Number(categoryTotals[category]))}
                                    </div>
                                </div>
                                
                                <DataTable
                                    data={items}
                                    columns={columns}
                                    onRowClick={handleRowClick}
                                />
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Empty state */}
                {!lineItemsLoading && (!enrichedLineItems || enrichedLineItems.length === 0) && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Aucun élément trouvé pour ce devis.</p>
                    </div>
                )}
            </div>
            
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={handleSetDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                itemName={deleteItem?.name || ''}
            />
            
            <QuoteEditModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                item={selectedItem}
            />
        </>
    );
}