import { useContext } from "react"
import { MondayContext } from "@/components/monday-context-provider"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

import { useTakeoffData } from "@/hooks/queries/"

export default function Takeoff() {
	const { context } = useContext(MondayContext)
	const { data: takeoffData } = useTakeoffData(context?.itemId, context?.boardId)
	
	return <div>
		<Accordion type="single" collapsible defaultValue="item-2">
			<AccordionItem value="item-2">
				<AccordionTrigger>Takeoff Data</AccordionTrigger>
				<AccordionContent>
					<pre>{JSON.stringify(takeoffData, null, 2)}</pre>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	</div>;
}
