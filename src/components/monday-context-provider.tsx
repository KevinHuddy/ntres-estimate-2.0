'use client';

import { createContext, useEffect, useState } from 'react';
import mondaySdk, { MondayClientSdk } from 'monday-sdk-js';
import { useTheme } from 'next-themes';

export const MondayContext = createContext<any>(null);
const monday: MondayClientSdk = mondaySdk();

export function MondayContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [context, setContext] = useState<any>();
	const { setTheme } = useTheme();

	useEffect(() => {
		monday.listen('context', (res) => {
			setContext(res.data);
		});
	});

	useEffect(() => {
		setTheme(context?.theme.toString());
	}, [context, setTheme]);

	return (
		<MondayContext.Provider value={{ context }}>
			{children}
		</MondayContext.Provider>
	);
}
