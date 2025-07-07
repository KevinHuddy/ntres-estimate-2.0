import { Circle, Loader2 } from "lucide-react"
import { Badge } from '@/components/ui/badge'

export function StatusBadge( { variant = "default" }: { variant: "syncing" | "default" | "error" | "success" } ) {
    return (
        <Badge 
            variant="outline" 
            className={`text-left h-6 w-6 p-0`}>
            {variant === "default" && <Circle className="fill-stone-200 " stroke="none" />}
            {variant === "success" && <Circle className="fill-green-500" stroke="none" />}
            {variant === "error" && <Circle className="fill-red-500 shadow-red-400" stroke="none" />}
            {variant === "syncing" && <Loader2 strokeWidth={3} className="animate-spin stroke-stone-900 dark:stroke-stone-100" />}
        </Badge>
    )
}