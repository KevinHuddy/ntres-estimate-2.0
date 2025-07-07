export type TableRootProps<TData, TValue> = {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
    children: React.ReactNode
    enableSelection?: boolean
    enableEditing?: boolean
}