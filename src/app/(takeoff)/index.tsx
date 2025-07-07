"use client"

// import { useContext } from "react"
import { MondayContext } from "@/components/monday-context-provider"
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
// import { LineItems } from "./table";
// import { useCallback, useEffect, useState } from "react";
// import { columns } from "./columns";

// import LineItemsTable from "./(components)/table";
// import { useTemplateLineItems } from "@/hooks/queries";
// import { useTakeoffLineItems } from "@/hooks/queries/use-line-items";
import { useContext } from "react";
import { createMondayItem } from "@/actions/monday-actions";

function MondayForm() {
	const { context } = useContext(MondayContext);
	const { userToken } = context;
  
	async function handleSubmit(formData) {
	  // Add token to form data
	  formData.append('token', userToken);
	  
	  try {
		const result = await createMondayItem(formData);
		console.log("result", result)
		// Handle success
	  } catch (error) {
		console.log(error)
		// Handle error
	  }
	}
  
	return (
	  <form action={handleSubmit}>
		<pre>{JSON.stringify(context, null, 2)}</pre>
		<input type="text" name="name" />
		<button type="submit">Submit</button>
	  </form>
	);
  }

export default function Takeoff() {

	
	// const [fakeData, setFakeData] = useState<any[]>([])
	// const { data: templateLineItems } = useTemplateLineItems({
	// 	boardId: "9322629477",
	// })
	// const { data: takeoffLineItems } = useTakeoffLineItems({
	// 	lineItemBoardId: "9324846864",
	// 	takeoffId: "9451706117",
	// 	limit: 500,
	// })
	
	// const fetchMyAPI = useCallback(async () => {
	// 	await new Promise((resolve) => setTimeout(resolve, 5000))

	// 	const response = await fetch("https://jsonplaceholder.typicode.com/posts")
	// 	const data = await response.json()
	// 	setFakeData(data)
	// }, [])
	
	// useEffect(() => {
	// 	fetchMyAPI()
	// }, [fetchMyAPI])
	
	return (
		<div>
			<MondayForm />
		</div>
	)
}
