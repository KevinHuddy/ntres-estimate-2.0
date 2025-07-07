import dynamic from "next/dynamic";
import { TableSkeleton } from "./skeletons/table";

const Table = dynamic(() => import("@/components/ui/table").then((mod) => mod.Table), { ssr: false })
const TableBody = dynamic(() => import("./body").then((mod) => mod.TableBody), { ssr: false })
const TableRoot = dynamic(() => import("./root").then((mod) => mod.TableRoot), {
    ssr: false,
    loading: () => <TableSkeleton />,
  })

export const LineItems = {
    Table: Table,
    Body: TableBody,
    Root: TableRoot
};

export default LineItems;