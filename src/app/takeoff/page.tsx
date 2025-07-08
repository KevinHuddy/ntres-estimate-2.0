'use client';

import Header from '@/components/header';
import HeaderActions from './(components)/takeoff-header-actions';
import { useMonday } from '@/components/monday-context-provider';
import Intro from './(components)/page-intro';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
import { Loading } from '@/components/loading';

import { useTakeoffData, useAdminFees } from '@/hooks/queries';
import { useMappedLineItems } from '@/hooks/compounds/use-mapped-line-items';
import { useMemo, useState, useCallback } from 'react';

import Category from './category';

import { createColumns } from './category/columns';

export default function Takeoff() {
	const { context } = useMonday();
	const itemId = context?.itemId;
	const {
		data: mappedLineItems,
		isLoading: mappedLineItemsLoading,
	} = useMappedLineItems(itemId);
	const { data: takeoff, isLoading: takeoffLoading } =
		useTakeoffData(itemId);
	const { data: adminFees, isLoading: adminFeesLoading } =
		useAdminFees(itemId);

	// Selection state management
	const [selectedRows, setSelectedRows] = useState<
		Record<string, boolean>
	>({});

	const handleSelectRow = useCallback((id: string, checked: boolean) => {
		const newSelectedRows = { ...selectedRows, [id]: checked };
		setSelectedRows(newSelectedRows);
		console.log(newSelectedRows);
	}, [selectedRows]);

	const handleEdit = useCallback((row: any) => {
		console.log('Edit row:', row);
		// Add your edit logic here
	}, []);

	const handleDelete = useCallback((id: string) => {
		console.log('Delete row:', id);
		// Add your delete logic here
	}, []);

	// Create columns with selection functionality
	const columns = useMemo(
		() =>
			createColumns({
				selectedRows,
				handleSelectRow,
				onEdit: handleEdit,
				onDelete: handleDelete,
			}),
		[selectedRows, handleSelectRow, handleEdit, handleDelete]
	);

	const categories = useMemo(() => {
		if (!mappedLineItems) return [];
		return mappedLineItems.reduce((acc, line) => {
			if (!acc.includes(line.category)) {
				acc.push(line.category);
			}
			return acc;
		}, [] as string[]);
	}, [mappedLineItems]);

	const categoryPages = useMemo(() => {
		return categories.map((category) => ({
			label: category,
			component: (
				<Category
					category={category}
					lines={mappedLineItems?.filter(
						(line) => line?.category === category
					)}
					takeoff={takeoff}
					columns={columns}
				/>
			),
		}));
	}, [categories, mappedLineItems, takeoff, columns]);

	const pages = [
		{
			label: 'Projet',
			component: (
				<Intro
					takeoff={takeoff}
					adminFees={adminFees}
					lines={mappedLineItems}
					categories={categories}
				/>
			),
		},
		...categoryPages,
	];

	return (
		<>
			<Header>
				{!takeoff?.disabled && (
					<HeaderActions
						isLoading={
							takeoffLoading ||
							mappedLineItemsLoading ||
							adminFeesLoading
						}
					/>
				)}
			</Header>
			{takeoffLoading ? (
				<Loading text="chargement des informations du devis" />
			) : mappedLineItemsLoading ? (
				<Loading text="chargement des items du devis" />
			) : adminFeesLoading ? (
				<Loading text="chargement des frais administratifs" />
			) : (
				<>
					<Tabs defaultValue={pages[0].label} className="h-full">
						<TabsList>
							{pages.map((page) => (
								<TabsTrigger
									key={page.label}
									value={page.label}
								>
									{page.label}
								</TabsTrigger>
							))}
						</TabsList>
						{pages.map((page) => (
							<TabsContent
								key={page.label}
								value={page.label}
							>
								{page.component}
							</TabsContent>
						))}
					</Tabs>
				</>
			)}
		</>
	);
}
