'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import mondaySdk, { MondayClientSdk } from 'monday-sdk-js';
import { useTheme } from 'next-themes';
import { useGetSettings } from '@/hooks/queries/use-settings';

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

	useEffect(() => {
		monday.listen('context', (res) => {
			setContext(res.data);
		});
	});

	useEffect(() => {
		setTheme(context?.theme.toString());
	}, [context, setTheme]);

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