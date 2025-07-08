import { Remove } from "@vibe/icons"
import { memo } from "react"

interface SupplierNameProps {
	supplierName?: string | null;
}

const SupplierName = memo(function SupplierName({ supplierName }: SupplierNameProps) {
	if (!supplierName) {
		return <Remove className="h-4 w-4 text-muted-foreground/40" />;
	}
	
	return <span>{supplierName}</span>;
});

export default SupplierName;
