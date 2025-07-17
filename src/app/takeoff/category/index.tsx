import { MemoizedDataTable } from "../data-table";
import TakeoffCategoryHeader from "./header";
import { SearchFilter, TypeFilter, useDataFilters } from "./filters";
import { useSuppliers } from "@/hooks/queries/use-suppliers";
import { useMemo, useCallback, useState } from "react";
import EditModal from "./edit-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useProducts } from "@/hooks/queries/use-products";

interface CategoryProps {
	category: string;
	lines: any[];
	takeoff: any;
	columns: any;
	editModalOpen?: boolean;
	setEditModalOpen?: (open: boolean) => void;
	selectedItem?: any;
	setSelectedItem?: (item: any) => void;
    disabled?: boolean;
}

export default function Category({ 
	category, 
	lines, 
	takeoff,
	columns,
	editModalOpen = false,
	setEditModalOpen,
	selectedItem,
	setSelectedItem,
    disabled = false,
}: CategoryProps) {
	// Fetch suppliers once at category level
	const { data: suppliers } = useSuppliers();
	const { data: products } = useProducts();
	
	// State for product selection dropdown
	const [productSelectOpen, setProductSelectOpen] = useState(false);
	
	// Create supplier name map for performance
	const supplierNameMap = useMemo(() => {
		if (!suppliers) return {};
		return Object.fromEntries(
			suppliers.map((supplier: any) => [supplier.id, supplier.name])
		);
	}, [suppliers]);

	// Enrich lines with supplier names to avoid hooks in each row
	const enrichedLines = useMemo(() => {
		return lines.map(line => ({
			...line,
			supplierName: line.linked_supplier ? supplierNameMap[line.linked_supplier] : null
		}));
	}, [lines, supplierNameMap]);

	const {
		searchTerm,
		setSearchTerm,
		selectedType,
		setSelectedType,
		filteredData,
	} = useDataFilters(enrichedLines);

	// Handle row click to open edit modal - memoized to prevent recreation
	const handleRowClick = useCallback((row: any) => {
		if (setSelectedItem && setEditModalOpen) {
			setSelectedItem(row);
			setEditModalOpen(true);
		}
	}, [setSelectedItem, setEditModalOpen]);

	// Handle product selection and open edit modal with pre-filled data
	const handleProductSelect = useCallback((product: any) => {
		if (setSelectedItem && setEditModalOpen) {
			// Create a new item with product data pre-filled
			const newItem = {
				id: null, // New item
				name: product.name,
				category: product.category || category,
				type: product.type || '',
				unit_type: product.unit_type || '',
				cost_takeoff: product.cost || 0,
				linked_supplier: product.linked_supplier?.[0] || '',
				qty_takeoff: 0,
				values: [],
				waste: 0,
				multiplier: 1,
				divider: 1,
				mo_qty: 1,
				mo_hours: 8,
				mo_days: 1,
				linked_activity_code: '',
			};
			
			setSelectedItem(newItem);
			setEditModalOpen(true);
		}
		setProductSelectOpen(false);
	}, [setSelectedItem, setEditModalOpen, category]);

	// Handle add item without product selection
	const handleAddItem = useCallback(() => {
		if (setSelectedItem && setEditModalOpen) {
			// Create a new empty item
			const newItem = {
				id: null, // New item
				name: '',
				category: category,
				type: '',
				unit_type: '',
				cost_takeoff: 0,
				linked_supplier: '',
				qty_takeoff: 0,
				values: [],
				waste: 0,
				multiplier: 1,
				divider: 1,
				mo_qty: 1,
				mo_hours: 8,
				mo_days: 1,
				linked_activity_code: '',
			};
			
			setSelectedItem(newItem);
			setEditModalOpen(true);
		}
		setProductSelectOpen(false);
	}, [setSelectedItem, setEditModalOpen, category]);

	return (
		<div className="h-full flex flex-col gap-6">
			<TakeoffCategoryHeader
				category={category}
				lines={lines}
				takeoff={takeoff}
				disabled={disabled}
			/>
			
			{/* Filters Section */}
			<div className="flex justify-between gap-4">
				<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
					<SearchFilter
						value={searchTerm}
						onChange={setSearchTerm}
						placeholder="Rechercher par nom..."
						className="flex-1 min-w-0 max-w-md"
					/>
					<TypeFilter
						value={selectedType}
						onChange={setSelectedType}
						data={lines}
						placeholder="Tous les types"
						className="w-full sm:w-48"
					/>
				</div>
				<div className="flex justify-end">
					<Popover open={productSelectOpen} onOpenChange={setProductSelectOpen}>
						<PopoverTrigger asChild>
							<Button disabled={disabled}>
								<Plus className="w-4 h-4" />
								Ajouter un item
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
											Créer un item vide
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
													{product.category} • {product.type} • {product.cost?.toFixed(2) || '0.00'}$
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
												<span>Créer un item vide</span>
											</div>
										</CommandItem>
									)}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<MemoizedDataTable
				data={filteredData}
				columns={columns}
				onRowClick={handleRowClick}
				disabled={disabled}
			/>

			<EditModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen || (() => {})}
				item={selectedItem}
				disabled={disabled}
			/>
		</div>
	);
}
