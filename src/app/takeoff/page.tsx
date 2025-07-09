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
import { useCreateLineItemsMutation, useDeleteLineItemMutation } from '@/hooks/mutations/use-line-items';
import { getBoardSettings } from '@/lib/utils';
import { useMemo, useState, useCallback } from 'react';

import Category from './category';

import { createColumns, DeleteConfirmDialog } from './category/columns';
import { toast } from 'sonner';

export default function Takeoff() {
	const { context, settings } = useMonday();
	const itemId = context?.itemId;
	const {
		data: mappedLineItems,
		isLoading: mappedLineItemsLoading,
	} = useMappedLineItems(itemId);
	const { data: takeoff, isLoading: takeoffLoading } =
		useTakeoffData(itemId);
	const { data: adminFees, isLoading: adminFeesLoading } =
		useAdminFees(itemId);

	// Mutations
	const createLineItemMutation = useCreateLineItemsMutation();
	const deleteLineItemMutation = useDeleteLineItemMutation();

	// Duplication state
	const [duplicatingItemId, setDuplicatingItemId] = useState<string | null>(null);

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

	const handleDuplicate = useCallback(async (row: any) => {
		try {
			setDuplicatingItemId(row.id);
			
			// Map original item data to columns format
			const { cols } = getBoardSettings(settings, "LINE_ITEMS");
			const columns = {
				[cols.CATEGORY]: row.category || '',
				[cols.TYPE]: row.type || '',
				[cols.UNIT_TYPE]: row.unit_type || '',
				[cols.QTY_TAKEOFF]: (row.qty_takeoff || 0).toString(),
				[cols.COST_TAKEOFF]: (row.cost_takeoff || 0).toString(),
				[cols.LINKED_SUPPLIER]: row.linked_supplier || '',
				[cols.VALUES]: row.values?.length ? row.values.join(',') : '',
				[cols.WASTE]: (row.waste || 0).toString(),
				[cols.MULTIPLIER]: (row.multiplier || 0).toString(),
				[cols.DIVIDER]: (row.divider || 0).toString(),
				[cols.MO_QTY]: (row.mo_qty || 0).toString(),
				[cols.MO_HOURS]: (row.mo_hours || 0).toString(),
				[cols.MO_DAYS]: (row.mo_days || 0).toString(),
				[cols.LINKED_ACTIVITY_CODE]: row.linked_activity_code || '',
				[cols.LINKED_TEMPLATE_LINE_ITEM]: row.linked_template_line_item || '',
			};

			const duplicateName = `${row.name} (Copie)`;

			await createLineItemMutation.mutateAsync({
				name: duplicateName,
				columns,
				takeoffId: itemId || '',
			});
			toast.success(`"${duplicateName}" a été créé avec succès`);
		} catch (error) {
			console.error('Error duplicating line item:', error);
			toast.error('Erreur lors de la duplication');
		} finally {
			setDuplicatingItemId(null);
		}
	}, [createLineItemMutation, itemId, settings]);

	const handleDelete = useCallback(async (id: string) => {
		try {
			await deleteLineItemMutation.mutateAsync({
				id,
				takeoffId: itemId || '',
			});
			toast.success('Élément supprimé avec succès');
			setDeleteDialogOpen(false);
			setDeleteItem(null);
		} catch (error) {
			console.error('Error deleting line item:', error);
			toast.error('Erreur lors de la suppression');
		}
	}, [deleteLineItemMutation, itemId]);

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
				duplicatingItemId,
			}),
		[selectedRows, handleSelectRow, handleEdit, handleDuplicate, duplicatingItemId]
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
