import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { DollarSign, Loader2, X } from "lucide-react"
import { useSuppliers } from "@/hooks/queries/use-suppliers"
import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCreatePriceRequest, useCreatePriceRequestSubitem } from "@/hooks/mutations/use-price-requests"
import { toast } from "sonner"
import { StatusBadge } from "@/components/status-badge"
import { SearchSelectCombobox } from "@/components/search-select-combobox"
import { useMonday } from "@/components/monday-context-provider"

export default function PriceRequestButton({ 
    selectedRows, 
    mappedLineItems,
    projectId,
    disabled
}: { 
    selectedRows: Record<string, boolean>;
    mappedLineItems: any[];
    projectId?: string;
    disabled?: boolean;
}) {
    const { context } = useMonday();
    const takeoffId = context?.itemId;
    const { data: suppliers } = useSuppliers();
    const [selectedSuppliers, setSelectedSuppliers] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supplierStatuses, setSupplierStatuses] = useState<Record<string, 'default' | 'syncing' | 'success'>>({});
    const { mutateAsync: createPriceRequest } = useCreatePriceRequest();
    const { mutateAsync: createPriceRequestSubitem } = useCreatePriceRequestSubitem();
    
    // Filter selected items and create stable identifiers
    const selectedItems = useMemo(() => {
        if (!mappedLineItems || !selectedRows) return [];
        
        return mappedLineItems.filter(item => 
            selectedRows[item.id] && 
            item.qty_takeoff > 0
        ).map((item, index) => ({
            ...item,
            stableKey: item.id || `item-${index}`,
            index
        }));
    }, [mappedLineItems, selectedRows]);

    // Get unique suppliers that are selected, in the order they will be processed
    const uniqueSelectedSuppliers = useMemo(() => {
        const supplierIds = new Set<string>();
        const orderedSupplierIds: string[] = [];
        
        // Process items in order and collect suppliers in the order they appear
        selectedItems.forEach(item => {
            const itemSuppliers = selectedSuppliers[item.stableKey] || [];
            itemSuppliers.forEach(supplierId => {
                if (!supplierIds.has(supplierId)) {
                    supplierIds.add(supplierId);
                    orderedSupplierIds.push(supplierId);
                }
            });
        });
        
        return orderedSupplierIds;
    }, [selectedSuppliers, selectedItems]);

    // Initialize supplier statuses when suppliers change
    useMemo(() => {
        const newStatuses: Record<string, 'default' | 'syncing' | 'success'> = {};
        uniqueSelectedSuppliers.forEach(supplierId => {
            if (!supplierStatuses[supplierId]) {
                newStatuses[supplierId] = 'default';
            } else {
                newStatuses[supplierId] = supplierStatuses[supplierId];
            }
        });
        setSupplierStatuses(newStatuses);
    }, [uniqueSelectedSuppliers]);

    // Handle supplier selection for an item
    const handleSupplierChange = (itemKey: string, supplierIds: string[]) => {
        setSelectedSuppliers(prev => ({
            ...prev,
            [itemKey]: supplierIds
        }));
    };

    // Handle adding a single supplier
    const handleAddSupplier = (itemKey: string, supplierId: string) => {
        if (!supplierId || !itemKey) return;
        
        const currentSelections = selectedSuppliers[itemKey] || [];
        if (!currentSelections.includes(supplierId)) {
            const newSelections = [...currentSelections, supplierId];
            handleSupplierChange(itemKey, newSelections);
        }
    };

    // Handle removing a supplier
    const handleRemoveSupplier = (itemKey: string, supplierId: string) => {
        if (!itemKey) return;
        
        const currentSelections = selectedSuppliers[itemKey] || [];
        const newSelections = currentSelections.filter(id => id !== supplierId);
        handleSupplierChange(itemKey, newSelections);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!takeoffId) return;
        
        setIsSubmitting(true);
        
        try {
            // Create supplier-organized data structure
            const supplierQuotes: Record<string, any[]> = {};
            
            // Process each selected item and organize by supplier
            selectedItems.forEach(item => {
                const itemSuppliers = selectedSuppliers[item.stableKey] || [];
                
                itemSuppliers.forEach(supplierId => {
                    if (!supplierQuotes[supplierId]) {
                        supplierQuotes[supplierId] = [];
                    }
                    
                    supplierQuotes[supplierId].push({
                        productId: item.id,
                        templateLineId: item.linked_template_line_item,
                        productName: item.name,
                        productCategory: item.category,
                        productType: item.type,
                        productQty: item.qty_takeoff,
                        unitType: item.unit_type,
                        estimatedCostPerUnit: item.cost_takeoff,
                        totalEstimatedCost: (Number(item.qty_takeoff) || 0) * (Number(item.cost_takeoff) || 0),
                        budget: item.values_total || 0
                    });
                });
            });

            // Create supplier details with their product lists
            const supplierQuoteRequests = Object.entries(supplierQuotes).map(([supplierId, products]) => {
                const supplier = suppliers?.find(s => s.id.toString() === supplierId);
                return {
                    supplierId: supplierId,
                    supplierName: supplier?.name || 'Unknown Supplier',
                    products: products,
                    totalProducts: products.length,
                    totalEstimatedValue: products.reduce((sum, product) => sum + product.totalEstimatedCost, 0)
                };
            });

            const submissionData = {
                supplierQuotes: supplierQuotes,
                supplierQuoteRequests: supplierQuoteRequests,
                summary: {
                    totalSuppliers: Object.keys(supplierQuotes).length,
                    totalItems: selectedItems.length,
                    totalValue: selectedItems.reduce((sum, item) => sum + ((Number(item.qty_takeoff) || 0) * (Number(item.cost_takeoff) || 0)), 0),
                    uniqueProducts: selectedItems.length
                }
            };

            // Process each supplier sequentially to avoid overwhelming the API
            for (const [supplierId] of Object.entries(submissionData.supplierQuotes)) {
                const supplierRequest = submissionData.supplierQuoteRequests.find((request: any) => request.supplierId === supplierId);
                
                // Update supplier status to syncing
                setSupplierStatuses(prev => ({ ...prev, [supplierId]: 'syncing' }));
                
                const priceRequestId = await createPriceRequest({
                    supplierId: supplierRequest?.supplierId,
                    supplierName: supplierRequest?.supplierName,
                    takeoffId: takeoffId,
                    projectId: projectId
                });
                
                // Process subitems for this supplier
                for (const product of submissionData.supplierQuotes[supplierId]) {
                    console.log({
                        parentItemId: priceRequestId,
                        itemName: product.productName,
                        qty: product.productQty,
                        unitType: product.unitType,
                        lineId: product.productId,
                        takeoffId: takeoffId,
                        productId: product.linked_product || null,
                    })
                    await createPriceRequestSubitem({
                        parentItemId: priceRequestId,
                        itemName: product.productName,
                        qty: product.productQty,    
                        unitType: product.unitType,
                        lineId: product.productId,
                        takeoffId: takeoffId,
                        productId: product.linked_product,
                    });
                }
                
                // Update supplier status to success after all subitems are processed
                setSupplierStatuses(prev => ({ ...prev, [supplierId]: 'success' }));
            }
            
            // Show overall success message
            toast.success(
                `Demandes de prix générées avec succès pour ${submissionData.summary.totalSuppliers} fournisseur(s) et ${submissionData.summary.totalItems} article(s)`
            );
            
        } catch (error) {
            console.error('Error creating price requests:', error);
            toast.error('Erreur lors de la génération des demandes de prix');
            
            // Reset all supplier statuses to default on error
            const resetStatuses: Record<string, 'default' | 'syncing' | 'success'> = {};
            uniqueSelectedSuppliers.forEach(supplierId => {
                resetStatuses[supplierId] = 'default';
            });
            setSupplierStatuses(resetStatuses);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer direction={"right"}>
            <DrawerTrigger asChild>
                <Button variant="secondary" size="sm" disabled={disabled}>
                    <DollarSign className="w-4 h-4" />
                    Demande de prix
                    {selectedItems.length > 0 && (
                        <Badge variant="default" className="ml-2">
                            {selectedItems.length}
                        </Badge>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1 border-b">
                    <DrawerTitle>Demande de prix</DrawerTitle>
                    <DrawerDescription>
                        Sélectionnez les fournisseurs pour chaque produit sélectionné
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm pt-4">
                    {selectedItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Aucun produit sélectionné</p>
                            <p className="text-xs mt-2">Sélectionnez des produits avec les cases à cocher pour créer une demande de prix</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {selectedItems.map((item) => {
                                const itemKey = item.stableKey;
                                const itemSuppliers = selectedSuppliers[itemKey] || [];
                                
                                return (
                                    <Card key={itemKey} className="border p-4">
                                        <CardContent className="p-0">
                                            {/* <pre className="w-[320px] rounded-md bg-slate-950 p-4">
                                                <code className="text-white w-auto whitespace-pre-wrap">
                                                    {JSON.stringify(settings, null, 2)}
                                                </code>
                                            </pre> */}
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-sm">{item.name}</h3>
                                                        {item.unit_type && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {item.unit_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="default" className="text-xs">
                                                        {item.qty_takeoff}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex flex-col gap-2">
                                                    <SearchSelectCombobox
                                                        options={suppliers?.map((supplier) => ({
                                                            value: supplier.id.toString(),
                                                            label: supplier.name
                                                        })) || []}
                                                        value=""
                                                        placeholder="Sélectionner un fournisseur"
                                                        searchPlaceholder="Rechercher un fournisseur..."
                                                        isLoading={false}
                                                        onSelect={(value) => {
                                                            handleAddSupplier(itemKey, value);
                                                        }}
                                                    />
                                                    
                                                    {/* Show selected suppliers */}
                                                    {itemSuppliers.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {itemSuppliers.map((supplierId, supplierIndex) => {
                                                                const supplier = suppliers?.find(s => s.id.toString() === supplierId);
                                                                return (
                                                                    <Badge 
                                                                        key={`badge-${itemKey}-${supplierId}-${supplierIndex}`}
                                                                        variant="secondary" 
                                                                        className="text-xs cursor-pointer px-3 flex items-center gap-1"
                                                                        onClick={() => handleRemoveSupplier(itemKey, supplierId)}
                                                                    >
                                                                        {supplier?.name}
                                                                        <X className="w-3 h-3" />
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                    {uniqueSelectedSuppliers.length > 0 && (
                        <div className="flex flex-col gap-2 px-4">
                            <div className="text-xs font-medium">Fournisseurs sélectionnés:</div>
                            <div className="flex flex-col gap-1 text-xs">
                                {uniqueSelectedSuppliers.map((supplierId) => {
                                    const supplier = suppliers?.find(s => s.id.toString() === supplierId);
                                    const supplierStatus = supplierStatuses[supplierId] || 'default';
                                    
                                    return (
                                        <div key={supplierId} className="flex items-center gap-2">
                                            <StatusBadge variant={supplierStatus} />
                                            <span className="text-xs text-muted-foreground">
                                                {supplier?.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <DrawerFooter className="flex flex-col gap-4 border-t">
                    <div className="flex flex-row gap-2">
                        <Button 
                            className="flex-1" 
                            variant="default"
                            disabled={selectedItems.length === 0 || Object.keys(selectedSuppliers).length === 0 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Génération...
                                </>
                            ) : (
                                'Générer la demande'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" className="flex-1" disabled={isSubmitting}>
                                Annuler
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
} 