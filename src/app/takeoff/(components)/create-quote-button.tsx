'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
// import { useProject } from "@/hooks/queries/use-project";
import { useCreateQuote } from "@/hooks/mutations/use-create-quote";
import { toast } from "sonner";
import { useQuotes } from "@/hooks/queries/use-quotes";

interface CreateQuoteButtonProps {
    projectId: string;
    takeoffId: string;
    total: number;
    disabled?: boolean;
}

export default function CreateQuoteButton({ projectId, takeoffId, total, disabled }: CreateQuoteButtonProps) {
    const [open, setOpen] = useState(false);
    const [quoteId, setQuoteId] = useState<string | null>(null);


    const { data: quotesData } = useQuotes(projectId);
    const { mutateAsync: createQuote, isPending } = useCreateQuote();

    const quotes = quotesData?.map((quote: any) => ({
        value: quote.id,
        label: quote.name,
    })) || [];

    const onClick = async () => {
        if (!quoteId) {
            toast.error("Veuillez sélectionner une soumission");
            return;
        }

        if (!takeoffId) {
            toast.error("ID de takeoff manquant");
            return;
        }

        try {
            const selectedQuote = quotes.find((quote: any) => quote.value === quoteId);
            
            const quoteData = {
                name: selectedQuote?.label,
                total: total,
                project_subitem: quoteId,
                project: projectId,
                takeoff: takeoffId,
            };

            await createQuote(quoteData);
            // Success toast is handled by the mutation
            setOpen(false);
            setQuoteId(null);
        } catch (error) {
            console.error("Error creating quote:", error);
            // Error toast is handled by the mutation
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" disabled={disabled}>
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
                        <Select onValueChange={(value: string) => setQuoteId(value)} value={quoteId || ""}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir la soumission" />
                            </SelectTrigger>
                            <SelectContent>
                                {quotes.map((quote: any) => (
                                    <SelectItem key={quote.value} value={quote.value}>
                                        {quote.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        variant="default" 
                        size="sm" 
                        onClick={onClick} 
                        disabled={!quoteId || isPending}
                    >
                        {isPending ? "Création..." : "Créer soumission"}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            setOpen(false);
                            setQuoteId(null);
                        }}
                    >
                        Annuler
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}