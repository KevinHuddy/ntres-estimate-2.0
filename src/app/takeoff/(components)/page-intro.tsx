import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { TableCell, TableRow } from "@/components/ui/table"

import { formatCurrency } from "@/lib/utils"

function IntroTableRow({ title, total }: { title: string, total: number }) {
    const formattedTotal = formatCurrency(total)
    
    return (
        <TableRow>
            <TableCell className="text-base py-3 px-4">
                {title}
            </TableCell>
            <TableCell className="text-base py-3 px-4 text-right font-bold">
                {formattedTotal}
            </TableCell>
        </TableRow>
    )
}

function IntroTable({ children }: { children: React.ReactNode }) {
    
    return (
        <Card className="p-0 flex-grow rounded-lg">
            <Table>
                <TableBody>
                    {children}
                </TableBody>
            </Table>
        </Card>
    )
}

function IntroHeader({ project, totals }: { project: any, totals: any }) {
    return (
        <div className="flex flex-row items-start gap-6 justify-between pt-6">
            <div className="flex flex-col gap-2">
                <small className="text-xl text-primary flex items-center gap-2">
                    Projet
                </small>
                <div className="flex items-center gap-2">
                    <h1 className="text-base text-balance font-medium sm:text-medium flex-col flex items-start gap-0">
                        <strong className="text-xl">{project?.number}</strong>
                        {project?.name}
                    </h1>
                </div>
            </div>
            <div>
                <h1 className="text-base text-balance font-medium sm:text-medium flex-col gap-2 flex text-right">
                    <span className="font-normal text-xl mt-2 text-primary">Total de l&apos;estimation</span>
                    <strong className="text-[2rem] font-semibold">
                        {formatCurrency(totals.get("Total"))}
                    </strong>
                </h1>
            </div>
        </div>
    )
}

function Intro({ takeoff, adminFees, lines, categories }: { takeoff: any, adminFees: any, lines: any, categories: any }) {
    
    const totals = new Map()

    const categoryTotals = useMemo(() => {
        const totals: { [key: string]: number } = {}
        categories.forEach((category: string) => {
            const total = lines.filter((line: any) => line.category === category).reduce((acc, line) => acc + (line?.cost_takeoff * line?.qty_takeoff || 0), 0)
            totals[category] = total
        })
        return totals
    }, [categories, lines])

    const subtotal = useMemo(() => {
        return Object.values(categoryTotals).reduce((acc, total) => acc + total, 0)
    }, [categoryTotals])
    
    const adminFeesTotals = useMemo(() => {
        return adminFees?.map(
            (fee: any) => {
                const total = categoryTotals[fee.name];
                const margin = fee.margin ? total * fee.margin / 100 : 0;
                const admin = fee.admin ? total * fee.admin / 100 : 0;
                const unforeseen = fee.unforeseen ? total * fee.unforeseen / 100 : 0;
                const other = fee.other ? total * fee.other / 100 : 0;
                return margin + admin + unforeseen + other;
            }
        ).reduce((acc: number, total: number) => acc + total, 0)
    }, [adminFees, categoryTotals])

    const cautionnementsTotals = useMemo(() => {
        // return 0
        return takeoff?.takeoff_fees?.map((fee: any) => {
            return fee.value * subtotal / 100 || 0
        }).reduce((acc: number, total: number) => acc + total, 0)
    }, [takeoff, subtotal])

    totals.set("Sous-total", subtotal)
    totals.set("Frais administratifs", adminFeesTotals)
    totals.set("Cautionnements et assurances", cautionnementsTotals)
    totals.set("Total", subtotal + adminFeesTotals + cautionnementsTotals)
        
    return (
        <IntroWrapper>
            <IntroHeader project={takeoff?.project} totals={totals} />
            <IntroBody>
            <IntroTable>
                {categories.map((category: string) =>
                    <IntroTableRow key={category} title={category} total={categoryTotals[category]} />
                )}
            </IntroTable>
            <IntroTable>
                {Array.from(totals.entries()).map(([title, total]) =>
                    <IntroTableRow key={title} title={title} total={total} />
                )}
            </IntroTable>
            </IntroBody>
        </IntroWrapper>
    )
}

function IntroWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="container-wrapper 3xl:fixed:px-0 flex-1 gap-6">
            <div className="overflow-hidden flex gap-6 justify-between flex-col w-full">
                {children}
            </div>
        </div>
    )
}

function IntroBody({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-4 max-w-full w-full flex flex-col gap-4">
            {children}
        </div>
    )
}

export default Intro