import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
// import { useMonday } from "@/components/monday-context-provider"

// import { useCreateQuote } from "@/mutations/quotes-mutation"
// import { useGetProject } from "@/queries/project-queries"
// import { useGetTakeoff } from "@/queries/takeoff-queries"


export default function CreateQuoteButton() {
    // const { context } = useMonday();
    // const takeoffId = context?.itemId;
    const [open, setOpen] = useState(false)
    // const [quoteId, setQuoteId] = useState<string | null>(null)
    // const { data: takeoff } = useGetTakeoff(takeoffId)
    // const { data: project } = useGetProject(takeoff?.project?.id)
    
    // const { mutateAsync: createQuote, isPending } = useCreateQuote()

    // const quotes = project?.subitems.map((subitem: any) => ({
    //     value: subitem.id,
    //     label: subitem.name,
    // }))

    const quotes = []
    const isPending = false

    const onClick = () => {
        console.log("create quote")
        // const quote = {
        //     name: project?.name,
        //     total: takeoff?.total,
        //     project_subitem: quoteId,
        //     project: project?.id,
        //     takeoff: takeoffId,
        // }
        // createQuote(
        //     { ...quote, itemId: takeoffId },
        //     { 
        //         onError: () => {
        //             setOpen(true)
        //         },
        //         onSuccess: () => {
        //             setOpen(false)
        //         }
        //     }
        // )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                    <Plus className="w-4 h-4" /> 
                    Créer soumission
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Créer une soumission</DialogTitle>
                    <DialogDescription>
                        Associer ce take off à une soumission.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 w-full">
                        {quotes?.length > 0 ? (
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir la soumission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Aucun</SelectItem>
                                <SelectSeparator />
                                {/* {quotes?.map((quote: any) => (
                                    <SelectItem key={quote.value} value={quote.value}>{quote.label}</SelectItem>
                                ))} */}
                            </SelectContent>
                        </Select>
                        ) : (
                            <p className="text-sm text-gray-500">Aucune soumission ouverte trouvée</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="default" size="sm" onClick={() => {onClick()}} disabled={isPending}>{isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer soumission"}</Button>
                    <Button variant="outline" size="sm" onClick={() => {setOpen(false)}}>Annuler</Button>
                </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}