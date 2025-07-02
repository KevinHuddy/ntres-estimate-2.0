import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function Loading({ text }: { text: string }) {
    return (
        <Card className="w-full">
            <CardContent className="flex justify-center items-center gap-4">
                <Loader2 className="w-4 h-4 animate-spin" /> {text}
            </CardContent>
        </Card>
    )
}