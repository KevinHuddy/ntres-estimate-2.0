import { DataTable } from "../data-table";
import TakeoffCategoryHeader from "./header";

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
	return (
		<div className="space-y-6">
			<TakeoffCategoryHeader
				category={category}
				lines={lines}
				takeoff={takeoff}
			/>
			<DataTable
				data={lines}
				columns={columns}
				height="400px"
			/>
		</div>
	);
}
