import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { TableCell, TableRow } from "@/components/ui/table"
import { useMonday } from "@/components/monday-context-provider"

function IntroTableRow({ title, total }: { title: string, total: number }) {
    const formattedTotal = new Intl.NumberFormat(
        "fr-CA",
        {
            style: "currency",
            currency: "CAD",
        }
    ).format(total)
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
                        {new Intl.NumberFormat(
                            "fr-CA",
                            { style: "currency", currency: "CAD" }
                        ).format(totals.get("Total"))}
                    </strong>
                </h1>
            </div>
        </div>
    )
}

function Intro({ takeoff, adminFees, lines, categories }: { takeoff: any, adminFees: any, lines: any, categories: any }) {
    const { settings } = useMonday()
    
    const totals = new Map()

    const categoryTotals = useMemo(() => {
        const totals: { [key: string]: number } = {}
        categories.forEach((category: string) => {
            const total = lines.filter((line: any) => line.category === category).reduce((acc, line) => acc + (line?.cost * line?.qty || 0), 0)
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
        const { settings } = takeoff || {}
        const gage = settings?.gage ? settings.gage * subtotal / 100 : 0
        const garantie = settings?.garantie ? settings.garantie * subtotal / 100 : 0
        const caution = settings?.caution ? settings.caution * subtotal / 100 : 0
        const amcq = settings?.amcq ? settings.amcq * subtotal / 100 : 0
        const caa = settings?.caa ? settings.caa * subtotal / 100 : 0
        return gage + garantie + caution + amcq + caa
    }, [takeoff, subtotal])

    totals.set("Sous-total", subtotal)
    totals.set("Frais administratifs", adminFeesTotals)
    totals.set("Cautionnements et assurances", cautionnementsTotals)
    totals.set("Total", subtotal + adminFeesTotals + cautionnementsTotals)
        
    return (
        <IntroWrapper>
            {/* <pre>{JSON.stringify(settings, null, 2)}</pre>   */}
            {/* <pre>{JSON.stringify(takeoff, null, 2)}</pre> */}
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