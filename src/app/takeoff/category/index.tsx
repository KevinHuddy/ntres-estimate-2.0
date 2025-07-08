import { DataTable } from "../data-table";
import TakeoffCategoryHeader from "./header";
import { SearchFilter, TypeFilter, useDataFilters } from "./filters";
import { useSuppliers } from "@/hooks/queries/use-suppliers";
import { useMemo, useState } from "react";
import EditModal from "./edit-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoryProps {
	category: string;
	lines: any[];
	takeoff: any;
	columns: any;
}

export default function Category({ 
	category, 
	lines, 
	takeoff,
	columns
}: CategoryProps) {
	// Modal state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<any>(null);

	// Fetch suppliers once at category level
	const { data: suppliers } = useSuppliers();
	
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

	// Handle row click to open edit modal
	const handleRowClick = (row: any) => {
		setSelectedItem(row);
		setEditModalOpen(true);
	};

	return (
		<div className="h-full flex flex-col gap-6">
			<TakeoffCategoryHeader
				category={category}
				lines={lines}
				takeoff={takeoff}
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
					<Button>
						<Plus className="w-4 h-4" />
						Ajouter un item
					</Button>
				</div>
			</div>

			<DataTable
				data={filteredData}
				columns={columns}
				height="600px"
				onRowClick={handleRowClick}
			/>

			<EditModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				item={selectedItem}
			/>
		</div>
	);
}
