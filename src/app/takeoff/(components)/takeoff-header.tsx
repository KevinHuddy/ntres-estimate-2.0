import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/utils";
// import { useCreateAdmin, useDeleteAdmin, useUpdateAdmin } from "@/mutations/admin-mutation";
import { useForm } from "react-hook-form";
// import { useMonday } from "@/components/monday-provider";
// import { useGetAdminFees } from "@/queries/admin-fee-queries";
import { useMemo } from "react";
import { useMonday } from "@/components/monday-context-provider";
import { useTakeoffData } from "@/hooks/queries/use-takeoff";
// import { useGetTakeoff } from "@/queries/takeoff-queries";

export default function TakeoffCategoryHeader({category, lines}: {category: string, lines: any[]}) {
	const { context } = useMonday()
	const itemId = context?.itemId
	const { data: takeoff } = useTakeoffData(itemId)


    // const admin = takeoff?.admin_fees?.find((admin: any) => admin.name === category)


    const subtotal = useMemo(() => {
        return lines.reduce((acc, line) => acc + (line?.cost * line?.qty || 0), 0)
    }, [lines])

    const cautionnementsTotals = useMemo(() => {
        const { settings } = takeoff
        const gage = settings.gage ? settings.gage * subtotal / 100 : 0
        const garantie = settings.garantie ? settings.garantie * subtotal / 100 : 0
        const caution = settings.caution ? settings.caution * subtotal / 100 : 0
        const amcq = settings.amcq ? settings.amcq * subtotal / 100 : 0
        const caa = settings.caa ? settings.caa * subtotal / 100 : 0
        return gage + garantie + caution + amcq + caa
    }, [takeoff, subtotal])

    const { mutateAsync: createAdmin } = useCreateAdmin()
    const { mutateAsync: updateAdmin } = useUpdateAdmin()
    const { mutateAsync: deleteAdmin } = useDeleteAdmin()

    const form = useForm({
        defaultValues: {
            id: admin?.id,
            takeoffId: itemId,
            name: category,
            margin: admin?.margin,
            admin: admin?.admin,
            unforeseen: admin?.unforeseen,
            other: admin?.other,
        }
    })

    const adminFeesTotals = useMemo(() => {
        const total = subtotal;
        const margin = form.watch("margin") ? total * Number(form.watch("margin")) / 100 : 0;
        const admin = form.watch("admin") ? total * Number(form.watch("admin")) / 100 : 0;
        const unforeseen = form.watch("unforeseen") ? total * Number(form.watch("unforeseen")) / 100 : 0;
        const other = form.watch("other") ? total * Number(form.watch("other")) / 100 : 0;
        return margin + admin + unforeseen + other
    }, [adminData, subtotal, form])

    const debouncedUpdateItem = useDebounce(async (formValues: any) => {
        if ( formValues.id && (
            !formValues.margin &&
            !formValues.admin &&
            !formValues.unforeseen &&
            !formValues.other
        )) {
            deleteAdmin(formValues)
            form.setValue("id", '')
        }
        else if ( formValues.id ) {
            updateAdmin(formValues)
        } else {
            createAdmin({
                ...formValues,
                name: category,
                takeoffId: itemId,
            }).then((res) => {
                form.setValue("id", res)
            })
        }
    }, 1000)
    

    const handleChange = (key: any, value: any) => {
        form.setValue(key, value)
        debouncedUpdateItem(form.getValues())
    }
    
    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
                <h2 className="text-base font-semibold mt-2">Frais administratifs</h2>
                <Card className="p-0 flex-grow rounded-lg">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">Profit (%)</TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold flex justify-end">
                                    <Input
                                        className="w-18 h-6"
                                        type="number"
                                        value={form.watch("margin") || ''}
                                        onChange={(e) => handleChange("margin", e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">Administration (%)</TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold flex justify-end">
                                    <Input
                                        className="w-18 h-6"
                                        type="number"
                                        value={form.watch("admin") || ''}
                                        onChange={(e) => handleChange("admin", e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">Imprévues (%)</TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold flex justify-end">
                                    <Input
                                        className="w-18 h-6"
                                        type="number"
                                        value={form.watch("unforeseen") || ''}
                                        onChange={(e) => handleChange("unforeseen", e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">Autres (%)</TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold flex justify-end">
                                    <Input
                                        className="w-18 h-6"
                                        type="number"
                                        value={form.watch("other") || ''}
                                        onChange={(e) => handleChange("other", e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="space-y-2">
                <h2 className="text-base font-semibold mt-2">Total matériaux</h2>
                <Card className="p-0 flex-grow rounded-lg">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">
                                    Sous-total
                                </TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold">
                                {new Intl.NumberFormat(
                                        "fr-CA",
                                        {
                                            style: "currency",
                                            currency:
                                                "CAD",
                                        }
                                    ).format(subtotal)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">
                                    Administration
                                </TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold">
                                    {new Intl.NumberFormat(
                                        "fr-CA",
                                        {
                                            style: "currency",
                                            currency:
                                                "CAD",
                                        }
                                    ).format(adminFeesTotals)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">
                                    Cautionnements et assurances
                                </TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold">
                                    {new Intl.NumberFormat(
                                        "fr-CA",
                                        {
                                            style: "currency",
                                            currency:
                                                "CAD",
                                        }
                                    ).format(cautionnementsTotals)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-sm py-2 px-2">
                                    Total
                                </TableCell>
                                <TableCell className="text-base py-2 px-2 text-right font-bold">
                                    {new Intl.NumberFormat(
                                        "fr-CA",
                                        {
                                            style: "currency",
                                            currency:
                                                "CAD",
                                        }
                                    ).format(subtotal + adminFeesTotals + cautionnementsTotals)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
