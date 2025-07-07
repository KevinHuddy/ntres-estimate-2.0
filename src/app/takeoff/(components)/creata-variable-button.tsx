import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

import { useCreateVariable } from "@/hooks/mutations"
import { useMonday } from "@/components/monday-context-provider"


const FormSchema = z.object({
    name: z.string().trim().min(1, "Le nom de la variable est obligatoire"),
    value: z.coerce.number().min(0, "La valeur de la variable doit être égale ou supérieure à 0."),
    unit: z.string().max(6, "La longueur de l'unité ne doit pas dépasser 6 caractères.").trim().optional()
})

export default function CreateVariableButton() {
    const { context } = useMonday()
    const itemId = context?.itemId
    const [open, setOpen] = useState(false)
    const { mutateAsync: createVariable, isPending } = useCreateVariable()

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            value: 0,
            unit: "",
        }
    })

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        await createVariable(
            { 
                name: data.name, 
                value: Number(data.value), 
                unit: data.unit, 
                takeoffId: itemId 
            },
            { 
                onError: () => {
                    setOpen(true)
                },
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                }
            }
        )
    }

    const debounceSubmit = useDebounce(form.handleSubmit(onSubmit), 1000)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <Plus size={16} />
                    Créer
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[400px] px-0">
                <DialogHeader className="px-6">
                    <DialogTitle className="text-base font-medium">Créer une variable</DialogTitle>
                    <DialogDescription>
                        Créer une variable réutilisable pour cette estimation.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(debounceSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 px-6 py-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2 w-full">
                                        <FormLabel className="text-sm font-normal">Nom de la variable</FormLabel>
                                        <FormControl>
                                        <Input {...field} onChange={(e) => {
                                            field.onChange(e.target.value)
                                        }} type="text" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2 w-full">
                                        <FormLabel className="text-sm font-normal">Valeur de la variable</FormLabel>
                                        <FormControl>
                                        <Input {...field} onChange={(e) => {
                                            field.onChange(e.target.value)
                                        }} type="number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2 w-full">
                                        <FormLabel className="text-sm font-normal">Type d&apos;unité</FormLabel>
                                        <FormControl>
                                        <Input {...field} onChange={(e) => {
                                            field.onChange(e.target.value)
                                        }} type="text" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Separator />
                        <DialogFooter className="px-6">
                            <Button variant="outline" size="sm" onClick={() => {setOpen(false)}} disabled={isPending}>Annuler</Button>
                            <Button variant="default" size="sm" type="submit" disabled={isPending}>{isPending ? <Loader2 className="animate-spin" size={16} /> : ""} Créer variable</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
      </Dialog>
    )
}