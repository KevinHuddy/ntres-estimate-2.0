import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRef } from "react"
import { useDebounce } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useMonday } from "@/components/monday-context-provider"
import { useTakeoffData } from "@/hooks/queries/use-takeoff"
import { useUpdateTakeoffMutation } from "@/hooks/mutations/use-takeoff-mutation"

const FormSchema = z.object({
    value: z.coerce.number().optional().nullable()
})

function TakeoffCautionnementRow({ takeoffFee }: { takeoffFee: any }) {
    const { mutateAsync: updateTakeoff, isPending: isUpdating } = useUpdateTakeoffMutation()
    const { context } = useMonday()
    const initialValue = takeoffFee.value || null
    const lastSubmittedValue = useRef(initialValue)
    
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            value: initialValue
        }
    })

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        // Don't submit if the value hasn't changed
        if (data.value === lastSubmittedValue.current) {
            return
        }

        try {
            await updateTakeoff({
                id: context?.itemId,
                columns: {
                    [takeoffFee.id]: data.value?.toString() || ''
                }
            })
            // Update the last submitted value after successful submission
            lastSubmittedValue.current = data.value
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
        // Allow empty values to be null instead of converting to 0
        const numericValue = value === '' ? null : Number(value)
        form.setValue('value', numericValue)
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
                                    value={field.value ?? ""}
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
    const { data: takeoff } = useTakeoffData(context?.itemId)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2 items-center justify-between px-4">
                <h2 className="text-sm font-semibold">Cautionnements et assurances</h2>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto px-4 text-sm">
                {takeoff?.takeoff_fees?.map((takeoffFee: any) => (
                    <TakeoffCautionnementRow key={takeoffFee.id} takeoffFee={takeoffFee} />
                ))}
            </div>
        </div>
    )
}