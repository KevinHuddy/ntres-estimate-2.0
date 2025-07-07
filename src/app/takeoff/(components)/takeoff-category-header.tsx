import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow as TableRowBase } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { useMonday } from "@/components/monday-context-provider";
import { formatCurrency } from "@/lib/utils";
import { useDeleteAdminFees, useCreateAdminFees, useUpdateAdminFees } from "@/hooks/mutations";
import { useAdminFees } from "@/hooks/queries";

export default function TakeoffCategoryHeader({category, lines, takeoff}: {category: string, lines: any[], takeoff: any}) {
    const { context } = useMonday();
    const itemId = context?.itemId;

    const { data: adminData } = useAdminFees(itemId)

    const adminFees = useMemo(() => {   
        return adminData?.find((admin: any) => admin.name === category) || {}
    }, [adminData, category])


    const subtotal = useMemo(() => {
        return lines.reduce((acc, line) => acc + (line?.cost_takeoff * line?.qty_takeoff || 0), 0)
    }, [lines])

    const cautionnementsTotals = useMemo(() => {
        return takeoff?.takeoff_fees?.reduce((acc, takeoffFee) => {
            return acc + (takeoffFee.value * subtotal / 100)
        }, 0) || 0
    }, [takeoff, subtotal])

    const { mutateAsync: createAdmin } = useCreateAdminFees()
    const { mutateAsync: updateAdmin } = useUpdateAdminFees()
    const { mutateAsync: deleteAdmin } = useDeleteAdminFees()

    const form = useForm({
        defaultValues: {
            id: adminFees?.id,
            takeoffId: itemId,
            name: category,
            margin: adminFees?.margin,
            admin: adminFees?.admin,
            unforeseen: adminFees?.unforeseen,
            other: adminFees?.other,
        }
    })

    const adminFeesTotals = useMemo(() => {
        const total = subtotal;
        const margin = adminFees?.margin ? total * Number(adminFees?.margin) / 100 : 0;
        const admin = adminFees?.admin ? total * Number(adminFees?.admin) / 100 : 0;
        const unforeseen = adminFees?.unforeseen ? total * Number(adminFees?.unforeseen) / 100 : 0;
        const other = adminFees?.other ? total * Number(adminFees?.other) / 100 : 0;
        return margin + admin + unforeseen + other
    }, [subtotal, adminFees])

    const debouncedUpdateItem = useDebounce(async (formValues: any) => {
        if ( formValues.id && (
            (!formValues.margin || formValues.margin == 0) &&
            (!formValues.admin || formValues.admin == 0) &&
            (!formValues.unforeseen || formValues.unforeseen == 0) &&
            (!formValues.other || formValues.other == 0)
        )) {
            await deleteAdmin({
                adminFeeId: formValues.id,
                takeoffId: itemId
            })
            form.setValue("id", '')
        }
        else if ( formValues.id ) {
            updateAdmin({
                takeoffId: itemId,
                adminFeeId: formValues.id,
                columns: {
                    margin: formValues.margin,
                    admin: formValues.admin,
                    unforeseen: formValues.unforeseen,
                    other: formValues.other,
                }
            })
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
                <h2 className="text-base font-semibold mt-2">Frais administratifs {category.toLowerCase()}</h2>
                <Card className="p-0 flex-grow rounded-lg">
                    <Table>
                        <TableBody>
                            <TableRow name="Profit (%)" total={form.watch("margin") || 0} inputKey="margin" onChange={(key, value) => handleChange(key, value)} form={form} />
                            <TableRow name="Administration (%)" total={form.watch("admin") || 0} inputKey="admin" onChange={(key, value) => handleChange(key, value)} form={form} />
                            <TableRow name="Imprévues (%)" total={form.watch("unforeseen") || 0} inputKey="unforeseen" onChange={(key, value) => handleChange(key, value)} form={form} />
                            <TableRow name="Autres (%)" total={form.watch("other") || 0} inputKey="other" onChange={(key, value) => handleChange(key, value)} form={form} />
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="space-y-2">
                <h2 className="text-base font-semibold mt-2">Total {category.toLowerCase()}</h2>
                <Card className="p-0 flex-grow rounded-lg">
                    <Table>
                        <TableBody>
                            <TableRow name="Sous-total" total={subtotal} />
                            <TableRow name="Administration" total={adminFeesTotals} />
                            <TableRow name="Cautionnements et assurances" total={cautionnementsTotals} />
                            <TableRow name="Total" total={subtotal + adminFeesTotals + cautionnementsTotals} />
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}


function TableRow({name, total, inputKey, onChange, form}: {name: string, total: number, inputKey?: string, onChange?: (inputKey: string, value: string) => void, form?: any}) {
    return (
        <TableRowBase>
            <TableCell className="text-sm py-2 px-2">
                {name}
            </TableCell>
            <TableCell className="text-base py-2 px-2 text-right font-bold flex justify-end">
                {
                    inputKey && onChange ? (
                        <Input
                            className="w-18 h-6"
                            type="number"
                            value={form.watch(inputKey) || ''}
                            onChange={(e) => onChange(inputKey, e.target.value)}
                            placeholder="0"
                        />
                    )
                    : formatCurrency(total)
                }
            </TableCell>
        </TableRowBase>
    )
}