'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import mondaySdk, { MondayClientSdk } from 'monday-sdk-js';
import { useTheme } from 'next-themes';
import { useGetSettings } from '@/hooks/queries/use-settings';
import { useRenderTracker } from '@/hooks/use-render-tracker';

export const MondayContext = createContext<any>(null);
const monday: MondayClientSdk = mondaySdk();

export function MondayContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [context, setContext] = useState<any>();
	const { setTheme } = useTheme();
	const { data: settings, isLoading: settingsLoading } = useGetSettings()

	// Track re-renders of the context provider
	useRenderTracker('MondayContextProvider', {
		hasContext: !!context,
		contextItemId: context?.itemId,
		contextTheme: context?.theme,
		hasSettings: !!settings,
		settingsLoading,
		settingsKeys: settings ? Object.keys(settings).length : 0
	});

	useEffect(() => {
		monday.listen('context', (res) => {
			setContext(res.data);
		});
	}, []);

	useEffect(() => {
		if (context?.theme) {
			setTheme(context.theme.toString());
		}
	}, [context?.theme, setTheme]); // Only depend on theme, not entire context

	return (
		<MondayContext.Provider value={{ monday, context, settings, settingsLoading }}>
			{children}
		</MondayContext.Provider>
	);
}


export function useMonday() {
	const context = useContext(MondayContext)
	if (!context) {
		throw new Error('useMonday must be used within a MondayContextProvider')
	}
	return context
}