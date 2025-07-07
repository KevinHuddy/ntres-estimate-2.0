import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import SettingsButton from "./takeoff-settings";
import CreateQuoteButton from "./create-quote-button";
import { useMonday } from "@/components/monday-context-provider";

export default function TakeoffHeaderActions() {
    const { context } = useMonday();

    return (
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
