"use client"

import { redirect } from 'next/navigation'
import { useMonday } from "@/components/monday-context-provider";
import { Loading } from "@/components/loading";

export default function RootingPage() {
	const { context, settings, settingsLoading } = useMonday();

	if ( settingsLoading ) {
		<Loading text="Chargement des paramètres..." />
	}

	const boardId = context?.boardId

	switch (boardId) {
		case settings?.BOARDS?.TAKEOFF:
			redirect('/takeoff')
		case settings?.BOARDS?.QUOTE:
			redirect('/quote')
		case settings?.BOARDS?.CONTRACT:
			redirect('/contract')
		default:
			return <div className="flex flex-col items-center justify-center h-screen">
				<div>🚨 L&apos;application doit être configurée</div>
			</div>
	}
}