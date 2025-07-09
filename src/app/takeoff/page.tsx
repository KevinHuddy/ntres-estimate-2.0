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

import { createColumns, DeleteConfirmDialog } from './category/columns';

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

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteItem, setDeleteItem] = useState<any>(null);

	// Edit modal state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<any>(null);

	const handleSelectRow = useCallback((id: string, checked: boolean) => {
		const newSelectedRows = { ...selectedRows, [id]: checked };
		setSelectedRows(newSelectedRows);
		console.log(newSelectedRows);
	}, [selectedRows]);

	const handleEdit = useCallback((row: any) => {
		console.log('Edit row:', row);
		setSelectedItem(row);
		setEditModalOpen(true);
	}, []);

	const handleDuplicate = useCallback((row: any) => {
		console.log('Duplicate row:', row);
		// TODO: Implement real mutation here
		alert(`Duplication de "${row.name}" en cours... (mutation à implémenter)`);
	}, []);

	const handleDelete = useCallback((id: string) => {
		console.log('Delete row:', id);
		// TODO: Implement real mutation here
		alert(`Suppression de l'élément avec ID ${id} en cours... (mutation à implémenter)`);
		setDeleteDialogOpen(false);
		setDeleteItem(null);
	}, []);

	// Handle delete confirmation
	const handleDeleteConfirm = useCallback(() => {
		if (deleteItem) {
			handleDelete(deleteItem.id);
		}
	}, [deleteItem, handleDelete]);

	// Create columns with selection functionality
	const columns = useMemo(
		() =>
			createColumns({
				selectedRows,
				handleSelectRow,
				onEdit: handleEdit,
				onDuplicate: handleDuplicate,
				setDeleteDialogOpen,
				setDeleteItem,
			}),
		[selectedRows, handleSelectRow, handleEdit, handleDuplicate]
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
					editModalOpen={editModalOpen}
					setEditModalOpen={setEditModalOpen}
					selectedItem={selectedItem}
					setSelectedItem={setSelectedItem}
				/>
			),
		}));
	}, [categories, mappedLineItems, takeoff, columns, editModalOpen, selectedItem]);

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
			<DeleteConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				itemName={deleteItem?.name || ''}
			/>
		</>
	);
}
