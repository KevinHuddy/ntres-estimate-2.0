"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SettingsForm from "@/app/settings/form"
import { useGetSettings } from "@/hooks/queries/use-settings"
import { Loading } from "@/components/loading"

export default function SettingsPage() {
    const { data: settings, isLoading: settingsLoading } = useGetSettings()
    const debug = false

    if (settingsLoading) {
        return <Loading text="Chargement des paramètres..." />
    }

    return (
        <Card className="w-xl mx-auto">
			<CardHeader>
                <CardTitle>NTR • Settings</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-8">
                {debug && <pre className="w-[320px] rounded-md bg-slate-950 p-4">
                    <code className="text-white w-auto whitespace-pre-wrap">
                        {JSON.stringify(settings, null, 2)}
                    </code>
                </pre>}
                <SettingsForm initialConfig={settings} debug={debug} />
            </CardContent>
        </Card>
    )
}