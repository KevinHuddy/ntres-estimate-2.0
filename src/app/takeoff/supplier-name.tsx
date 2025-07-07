import { Skeleton } from "@/components/ui/skeleton"
import { useSuppliers } from "@/hooks/queries/use-suppliers"
import { useMemo } from "react"
import { Remove } from "@vibe/icons"

export default function SupplierName({ supplierId }: { supplierId: string }) {

    const { data: suppliers, isLoading: suppliersLoading } = useSuppliers()

    const supplierName = useMemo(() => suppliers?.find((supplier) => supplier?.id === supplierId)?.name, [suppliers, supplierId])

    return (
        <>
            {
                suppliersLoading 
                ? <Skeleton className="w-[140px] h-1 rounded-sm" /> 
                : supplierName 
                    ? <span>{supplierName}</span> 
                    : <div><Remove className="h-4 w-4 text-muted-foreground/40" /></div>
            }
        </>
    )
}
