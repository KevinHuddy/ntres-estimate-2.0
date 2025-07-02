"use client"

import { useContext } from "react";
import { Loader2 } from "lucide-react";

import { MondayContext } from "@/components/monday-context-provider";
import { BOARDS } from "@/temp-config";

import Takeoff from "./(takeoff)";
import Quote from "./(quote)";
import Contract from "./(contract)";

export default function Home() {
	const { context } = useContext(MondayContext);
	const boardId = context?.boardId

	switch (boardId) {
		case BOARDS.TAKEOFF:
		  return <Takeoff />
		case BOARDS.QUOTE:
			return <Quote />
		case BOARDS.CONTRACT:
			return <Contract />
		default:
			return <div className="flex justify-center p-6">
				<Loader2 className="w-4 h-4 animate-spin" />
			</div>
	}
}