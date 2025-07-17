"use client"

import { redirect } from 'next/navigation'
import { useMonday } from "@/components/monday-context-provider";
import { Loading } from "@/components/loading";

export default function RootingPage() {
	const { context, settings, settingsLoading } = useMonday();

    if ( settingsLoading ) {
		<Loading text="Chargement des paramètres..." />
	} else {
        const { BOARDS } = settings

        if ( !BOARDS ) {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <div>🚨 L&apos;application doit être configurée 1</div>
                </div>
            )
        } else if ( !context?.boardId ) {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <div>🚨 L&apos;application doit être configurée 2</div>
                </div>
            )
        } else if ( context?.boardId == BOARDS.TAKEOFF ) {
            redirect('/takeoff')
        } else if ( context?.boardId == BOARDS.QUOTES ) {
            redirect('/quote')
        } else if ( context?.boardId == BOARDS.CONTRACT ) {
            redirect('/contract')
        } else {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <div>🚨 L&apos;application doit être configurée 3</div>
                </div>
            )
        }
    }
}