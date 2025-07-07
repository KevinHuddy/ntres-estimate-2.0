import { DataTable } from "../data-table";
import TakeoffCategoryHeader from "./header";
import { SearchFilter, TypeFilter, useDataFilters } from "./filters";

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
	const {
		searchTerm,
		setSearchTerm,
		selectedType,
		setSelectedType,
		filteredData,
	} = useDataFilters(lines);

	return (
		<div className="space-y-6">
			<TakeoffCategoryHeader
				category={category}
				lines={lines}
				takeoff={takeoff}
			/>
			
			{/* Filters Section */}
			<div className="space-y-4">
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
				
				{/* Results count */}
				<div className="text-sm text-muted-foreground">
					Affichage de {filteredData.length} sur {lines.length} lignes
				</div>
			</div>

			<DataTable
				data={filteredData}
				columns={columns}
				height="400px"
			/>
		</div>
	);
}
