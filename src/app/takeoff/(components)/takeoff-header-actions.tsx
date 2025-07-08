import SettingsButton from "./takeoff-settings";
import CreateQuoteButton from "./create-quote-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export default function TakeoffHeaderActions({
    isLoading,
}: {
    isLoading: boolean
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
                        <Button variant="secondary" size="sm">
                            <DollarSign size={16} />
                            Demande de prix
                        </Button>
                        <SettingsButton />
                    </>
                )
            }
        </>
    )
}
