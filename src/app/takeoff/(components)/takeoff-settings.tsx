import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Settings2 } from "lucide-react"
import TakeoffCautionnements from "./takeoff-cautionnements";
import SettingsVariables from "./takeoff-variables";
import CreateVariableButton from "./creata-variable-button";

export default function SettingsButton() {
	return (
		<Drawer direction={"right"}>
			<DrawerTrigger asChild>
				<Button variant="default" size="sm">
					<Settings2 size={16} />
					<span className="sr-only">Configuration</span>
				</Button>
			</DrawerTrigger>
			<DrawerContent onInteractOutside={event => event.preventDefault()}>
				<DrawerHeader className="gap-1 border-b">
					<DrawerTitle>Variables</DrawerTitle>
					<DrawerDescription>
						Créer ou modifier les variables du takeoff
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-4 py-4">

					<TakeoffCautionnements />  

					<Separator />
					<div className="flex flex-col gap-2 overflow-y-auto px-4 text-sm">
						<h2 className="text-sm font-semibold">Variables de calculs</h2>
						<SettingsVariables />
					</div>
					<div className="px-4 flex">
						<CreateVariableButton />
					</div>
					<Separator />
				</div>
				<DrawerFooter className="flex flex-row gap-2 border-t">
					<DrawerClose asChild>
						<Button variant="secondary" className="flex-1">Fermer</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
      	</Drawer>
    )
}