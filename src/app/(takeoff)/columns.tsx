import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<any>[] = [
    {   
        id: "id",
        header: "ID",
        cell: ({ row }) => {
            return <div>{row.original.id}</div>
        }
    },
    {
        id: "title",
        header: "Title",
        cell: ({ row }) => {
            return <div>{row.original.title}</div>
        }
    }
]