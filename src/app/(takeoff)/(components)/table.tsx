import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import EditableCell from "./EditableCell";

const columns = [
    {
        accessorKey: 'userId',
        header: "userId",
        cell: (props) => <p>{props.getValue()}</p>
    },
    {
        accessorKey: 'id',
        header: "id",
        size: 300,
        cell: (props) => <p>{props.getValue()}</p>
    },
    {
        accessorKey: 'title',
        header: "title",
        size: 500,
        cell: (props) => <EditableCell {...props} />
    }
]

const LineItemsTable = () => {
    const [data, setData] = useState(fakeData)
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
		meta: {
			updateData: (rowIndex, columnId, value) => setData(
				(prev) => prev.map(
					(row, index) => 
						index === rowIndex 
							? { ...row, [columnId]: value } 
							: row
				)
			)
		}
    });
    

    return <Card className={`w-[${table.getTotalSize()}px]`}>
        <CardHeader>
            <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
            {table.getHeaderGroups().map(headerGroup => (
                <div key={headerGroup.id}>
                    {headerGroup.headers.map(
                        header => <div key={header.id} style={{ width: header.getSize() }}>{header.column.columnDef?.header as string}</div>
                    )}
                </div>
            ))}
            {
                table.getRowModel().rows.map(row => (
                    <div key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <div key={cell.id} style={{ width: cell.column.getSize() }}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </div>
                        ))}
                    </div>
                ))
            }
        </CardContent>
    </Card>
};

export default LineItemsTable