import SettingsButton from "./takeoff-settings";
import CreateQuoteButton from "./create-quote-button";
import PriceRequestButton from "./price-request-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TakeoffHeaderActions({
    isLoading,
    selectedRows,
    mappedLineItems,
    projectId,
}: {
    isLoading: boolean;
    selectedRows?: Record<string, boolean>;
    mappedLineItems?: any[];
    projectId?: string;
}) {
    return (
        <>
            {
                isLoading ? (
                    <div className="flex flex-row gap-2">
                        <Skeleton className="w-[140px] h-8 rounded-sm bg-muted" />
                        <Skeleton className="w-8 h-8 rounded-sm bg-muted" />
                    </div>
                ) : (
                    <>
                        <CreateQuoteButton/>
                        <PriceRequestButton 
                            selectedRows={selectedRows || {}}
                            mappedLineItems={mappedLineItems || []}
                            projectId={projectId}
                        />
                        <SettingsButton />
                    </>
                )
            }
        </>
    )
}
