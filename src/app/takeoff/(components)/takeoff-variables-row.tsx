import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDeleteVariable, useUpdateVariable } from "@/hooks/mutations/use-variables-mutation"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "@/lib/utils"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { StatusBadge } from "@/components/status-badge"
import { memo, useCallback } from "react"
import { useMonday } from "@/components/monday-context-provider"

export const VariableForm = memo(function VariableForm({ variable }: { variable: any }) {
    const { mutateAsync: updateVariable, isPending: isUpdating } = useUpdateVariable()
    const { mutateAsync: deleteVariable, isPending: isDeleting } = useDeleteVariable()
    const { context } = useMonday()

    const VariableFormSchema = z.object({
        name: z.string().trim().min(1, "Le nom de la variable est obligatoire"),
        value: z.coerce.number().min(0, "La valeur de la variable doit être égale ou supérieure à 0."),
        unit: z.string().max(6, "La longueur de l'unité ne doit pas dépasser 6 caractères.").trim().optional(),
    })

    const form = useForm({
        resolver: zodResolver(VariableFormSchema),
        defaultValues: {
            name: variable.name,
            value: variable.value || 0,
            unit: variable.unit || ""
        }
    })
    

    const onSubmit = useCallback(async (data: z.infer<typeof VariableFormSchema>) => {
        try {
            await updateVariable({ 
                variableId: variable.id, 
                columns: data,
                name: data.name
            })
        } catch (error) {
            console.error('Error updating variable:', error)
        }
    }, [updateVariable, variable.id])

    const onDelete = useCallback(async () => {
        try {
            await deleteVariable({ takeoffId: context?.itemId, variableId: variable.id })
        } catch (error) {
            console.error('Error deleting variable:', error)
        }
    }, [context?.itemId, deleteVariable, variable.id])
    
    const debounceSubmit = useDebounce(form.handleSubmit(onSubmit), 1000)
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row gap-2 items-center ml-[-12px]">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex flex-col gap-2 w-full">
                            <FormControl>
                                <Input {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        field.onChange(e.target.value)
                                        debounceSubmit()
                                    }}
                                    type="text" 
                                    className="
                                    !text-xs !px-2
                                    w-auto grow-1 hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 border-transparent bg-transparent shadow-none focus-visible:border dark:bg-transparent
                                    "
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        field.onChange(e.target.value)
                                        debounceSubmit()
                                    }}
                                    type="number" 
                                    className="w-18 grow-0 text-right h-8 !text-xs !px-2" 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem className="">
                            <FormControl>
                                <Input {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        field.onChange(e.target.value)
                                        debounceSubmit()
                                    }}
                                    type="text" 
                                    className="w-12 grow-0 text-right !text-xs !px-2" 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    onClick={onDelete} 
                    disabled={isDeleting}
                    className={isDeleting ? "opacity-50 cursor-not-allowed" : ""}
                >
                    <Trash size={16} className={isDeleting ? "animate-pulse" : ""} />
                </Button>
                <StatusBadge variant={isUpdating || isDeleting ? "syncing" : "success"} />
            </form>
        </Form>
        
    )
})