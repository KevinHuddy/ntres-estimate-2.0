import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDebounce } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { StatusBadge } from "@/components/status-badge"
import { toast } from "sonner"
import { useMonday } from "@/components/monday-context-provider"
import { useTakeoffData } from "@/hooks/queries/use-takeoff"
import { useUpdateTakeoffMutation } from "@/hooks/mutations/use-takeoff-mutation"

const FormSchema = z.object({
    value: z.coerce.number().min(0, { message: "La valeur doit être égale ou supérieure à 0." })
})

function TakeoffCautionnementRow({ takeoffFee }: { takeoffFee: any }) {
    const { mutateAsync: updateTakeoff, isPending: isUpdating } = useUpdateTakeoffMutation()
    const { context } = useMonday()
    
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            value: takeoffFee.value || 0
        }
    })

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            await updateTakeoff({
                id: context?.itemId,
                columns: {
                    [takeoffFee.id]: data.value.toString()
                }
            })
            toast.success(`${takeoffFee.name} mis à jour avec succès`)
        } catch (error) {
            console.error(error)
            toast.error(`Erreur lors de la mise à jour de ${takeoffFee.name}`)
        }
    }

    const debouncedSubmit = useDebounce(() => {
        const values = form.getValues()
        onSubmit(values)
    }, 1000)

    const handleChange = (value: string) => {
        form.setValue('value', Number(value))
        debouncedSubmit()
    }

    const handleBlur = () => {
        const values = form.getValues()
        onSubmit(values)
    }

    return (
        <Form {...form}>
            <form className="flex flex-row gap-3 justify-between w-full items-center">
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem className="flex flex-row gap-3 justify-between w-full items-center">
                            <FormLabel className="text-sm font-normal">{takeoffFee.name}</FormLabel>
                            <FormControl>
                                <Input 
                                    className="h-8 w-24" 
                                    {...field} 
                                    onChange={(e) => handleChange(e.target.value)}
                                    onBlur={handleBlur}
                                    type="number"
                                    disabled={isUpdating}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}

export default function TakeoffCautionnements() {
    const { context } = useMonday()
    const { data: takeoff, isLoading: takeoffLoading } = useTakeoffData(context?.itemId)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2 items-center justify-between px-4">
                <h2 className="text-sm font-semibold">Cautionnements et assurances</h2>
                <StatusBadge variant={takeoffLoading ? "syncing" : "success"} />
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto px-4 text-sm">
                {takeoff?.takeoff_fees?.map((takeoffFee: any) => (
                    <TakeoffCautionnementRow key={takeoffFee.id} takeoffFee={takeoffFee} />
                ))}
            </div>
        </div>
    )
}