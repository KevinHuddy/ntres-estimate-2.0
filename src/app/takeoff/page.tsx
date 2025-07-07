'use client';

import Header from '@/components/header';
import TakeoffHeader from './(components)/takeoff-header';
import TakeoffTable from "./(components)/takeoff-table"
import TakeoffHeaderActions from './(components)/takeoff-header-actions';
import { useMonday } from '@/components/monday-context-provider';

export default function Takeoff() {
	const { settingsLoading } = useMonday();
	
	return (
		<>
			<Header>
				{!settingsLoading && <TakeoffHeaderActions />}
			</Header>
			<TakeoffHeader />
			<TakeoffTable />
		</>
	);
}
