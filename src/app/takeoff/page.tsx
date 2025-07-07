'use client';

import Header from '@/components/header';
// import TakeoffHeader from './(components)/takeoff-header';
// import TakeoffTable from "./(components)/takeoff-table"
// import TakeoffHeaderActions from './(components)/takeoff-header-actions';
import { useMonday } from '@/components/monday-context-provider';
import Intro from './(components)/page-intro';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading } from '@/components/loading'

import { useTakeoffData, useVariables, useAdminFees } from '@/hooks/queries';
import { useMappedLineItems } from '@/hooks/compounds/use-mapped-line-items';

export default function Takeoff() {
	const { settings, context } = useMonday();
	const itemId = context?.itemId;
    const { data: mappedLineItems, isLoading: mappedLineItemsLoading } = useMappedLineItems(itemId);
	const { data: takeoff, isLoading: takeoffLoading } = useTakeoffData(itemId);
    const { data: variables, isLoading: variablesLoading } = useVariables(itemId);
	const { data: adminFees, isLoading: adminFeesLoading } = useAdminFees(itemId);  
    
    const categories = ['Matériaux', 'Main d\'oeuvre', 'Frais', 'Autre']
	
	// const { data: takeoff, isLoading: takeoffLoading } = useTakeoffData(itemId);
	// const { data: takeoffLines, isLoading: takeoffLinesLoading } = useTakeoffLines(itemId);
	// const { data: templatesLines, isLoading: templatesLinesLoading } = useTemplatesLines(itemId);
	// const { data: adminFees, isLoading: adminFeesLoading } = useAdminFees(itemId);
	// const { data: variables, isLoading: variablesLoading } = useVariables(itemId);

	const pages = [
        {
            label: "Projet",
            component: <Intro takeoff={takeoff} adminFees={adminFees} lines={mappedLineItems} categories={categories} />,
        }
    ]
	
	return (
		<>
            {takeoffLoading ? <><Header /><Loading text="chargement des informations du devis" /></> :
            mappedLineItemsLoading ? <><Header /><Loading text="chargement des items du devis" /></> :
            adminFeesLoading ? <><Header /><Loading text="chargement des frais administratifs" /></> :
            variablesLoading ? <><Header /><Loading text="chargement des variables" /></> :
            (
                <>
                    <Header>
                        {/* {!takeoff?.disabled && <HeaderActions takeoffId={itemId} />} */}
                        {/* <HeaderActions takeoffId={itemId} /> */}
                    </Header>
                    <Tabs defaultValue={pages[0].label}>
                        <TabsList>
                            {pages.map((page) => (
                                <TabsTrigger key={page.label} value={page.label}>{page.label}</TabsTrigger>
                            ))}
                        </TabsList>
                        {pages.map((page) => (
                            <TabsContent key={page.label} value={page.label}>{page.component}</TabsContent>
                        ))}
                    </Tabs>   
                </>
            )}
        </>
	);
}
