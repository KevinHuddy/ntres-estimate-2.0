'use client';

import { scan } from "react-scan";
import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	useEffect(() => {
		scan();
	}, []);

	return (
		<NextThemesProvider {...props}>{children}</NextThemesProvider>
	);
}