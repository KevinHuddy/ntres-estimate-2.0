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
import { useMemo, useState, useCallback, memo, useRef } from 'react';

import Category from './category';

import { createColumns, DeleteConfirmDialog } from './category/columns';
import { toast } from 'sonner';
// import { useRenderTracker, RenderCounter } from '@/hooks/use-render-tracker';

// Memoize the Category component to prevent unnecessary re-renders
const MemoizedCategory = memo(Category);

export default function Takeoff() {
	// Track re-renders
	const { context, settings } = useMonday();
	const itemId = context?.itemId;
	
	// Add detailed tracking for each piece of data
	// useRenderTracker('Takeoff-Context', { 
	// 	hasContext: !!context,
	// 	itemId: context?.itemId,
	// 	theme: context?.theme,
	// 	settingsExists: !!settings,
	// 	settingsKeys: settings ? Object.keys(settings).join(',') : 'none'
	// });

	const {
		data: mappedLineItems,
		isLoading: mappedLineItemsLoading,
	} = useMappedLineItems(itemId);
	
	// useRenderTracker('Takeoff-MappedLineItems', {
	// 	itemId,
	// 	dataLength: mappedLineItems?.length || 0,
	// 	isLoading: mappedLineItemsLoading,
	// 	hasData: !!mappedLineItems
	// });

	const { data: takeoff, isLoading: takeoffLoading } =
		useTakeoffData(itemId);
		
	// useRenderTracker('Takeoff-TakeoffData', {
	// 	itemId,
	// 	isLoading: takeoffLoading,
	// 	hasData: !!takeoff,
	// 	takeoffId: takeoff?.id
	// });

	const { data: adminFees, isLoading: adminFeesLoading } =
		useAdminFees(itemId);
		
	// useRenderTracker('Takeoff-AdminFees', {
	// 	itemId,
	// 	isLoading: adminFeesLoading,
	// 	hasData: !!adminFees,
	// 	feesLength: adminFees?.length || 0
	// });

	// Mutations
	const createLineItemMutation = useCreateLineItemsMutation();
	const deleteLineItemMutation = useDeleteLineItemMutation();

	// Use a ref to track duplicating items to prevent re-renders
	const duplicatingItemsRef = useRef<Set<string>>(new Set());
	const [, forceUpdate] = useState({});

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

	// Fix: Remove selectedRows from dependencies to prevent unnecessary re-renders
	const handleSelectRow = useCallback((id: string, checked: boolean) => {
		setSelectedRows(prev => ({ ...prev, [id]: checked }));
	}, []);

	const handleEdit = useCallback((row: any) => {
		console.log('Edit row:', row);
		setSelectedItem(row);
		setEditModalOpen(true);
	}, []);

	// Memoize the board settings to prevent recalculation
	const boardSettings = useMemo(() => 
		getBoardSettings(settings, "LINE_ITEMS"), 
		[settings]
	);

	const handleDuplicate = useCallback(async (row: any) => {
		const rowId = row.id;
		
		// Add to duplicating set and force update
		duplicatingItemsRef.current.add(rowId);
		forceUpdate({});
		
		try {
			// Use memoized board settings
			const { cols } = boardSettings;
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
			// Remove from duplicating set and force update
			duplicatingItemsRef.current.delete(rowId);
			forceUpdate({});
		}
	}, [createLineItemMutation, itemId, boardSettings]);

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

	// Memoize delete dialog handlers to prevent re-renders
	const handleSetDeleteDialogOpen = useCallback((open: boolean) => {
		setDeleteDialogOpen(open);
	}, []);

	const handleSetDeleteItem = useCallback((item: any) => {
		setDeleteItem(item);
	}, []);

	// Check if an item is duplicating using the mutation state
	const isDuplicating = useCallback((itemId: string) => {
		return duplicatingItemsRef.current.has(itemId);
	}, []);

	// Calculate total from line items
	const total = useMemo(() => {
		if (!mappedLineItems) return 0;
		return mappedLineItems.reduce((sum, item) => {
			const cost = Number(item.cost_takeoff) || 0;
			const qty = Number(item.qty_takeoff) || 0;
			return sum + (cost * qty);
		}, 0);
	}, [mappedLineItems]);

	// Create columns with stable references - only recreate when handlers change
	const columns = useMemo(
		() =>
			createColumns({
				selectedRows,
				handleSelectRow,
				onEdit: handleEdit,
				onDuplicate: handleDuplicate,
				setDeleteDialogOpen: handleSetDeleteDialogOpen,
				setDeleteItem: handleSetDeleteItem,
				isDuplicating,
			}),
		[selectedRows, handleSelectRow, handleEdit, handleDuplicate, handleSetDeleteDialogOpen, handleSetDeleteItem, isDuplicating]
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
				<MemoizedCategory
					key={category}
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

	const pages = useMemo(() => [
		{
			label: 'Projet',
			component: (
                <>
                {/* <pre className="text-white">{JSON.stringify(settings, null, 2)}</pre> */}
                    <Intro
                        takeoff={takeoff}
                        adminFees={adminFees}
                        lines={mappedLineItems}
                        categories={categories}
                    />
                </>
			),
		},
		...categoryPages,
	], [takeoff, adminFees, mappedLineItems, categories, categoryPages]);

	const isLoading = takeoffLoading || mappedLineItemsLoading || adminFeesLoading;

	return (
		<>
        {/* <pre className="text-white">{JSON.stringify(settings, null, 2)}</pre> */}
			{/* <RenderCounter name="Takeoff" /> */}
            {/* <pre className="text-white">{JSON.stringify(takeoff, null, 2)}</pre> */}
			<Header>
				{!takeoff?.disabled && (
					<HeaderActions
						isLoading={isLoading}
						selectedRows={selectedRows}
						mappedLineItems={mappedLineItems}
						projectId={takeoff?.project?.id}
						takeoffId={itemId}
						total={total}
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
				onOpenChange={handleSetDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				itemName={deleteItem?.name || ''}
			/>
		</>
	);
}
