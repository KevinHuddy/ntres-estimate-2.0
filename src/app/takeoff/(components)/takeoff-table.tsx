'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/table/table';
import { UserEditDialog } from './takeoff-edit-dialog';


import { Edit as EditIcon, Delete as DeleteIcon } from '@vibe/icons'
import useMappedLineItems from '@/hooks/compounds/use-mapped-line-items';
import { useMonday } from '@/components/monday-context-provider';
import { Loading } from '@/components/loading';

// Create a small list of mock users directly
const takeoffLineItems = [
	{
		id: '1',
		name: 'Couronnement',
		category: 'Matériaux',
		type: 'Autre matériaux',
		unit: 'm2',
		activityCode: '24-0001',
		waste: 0.05,
		divider: 4,
		multiplier: 7,
		supplierIds: ['123', '456'],
		productId: ['1235'],
		price: 100,
		//
		templateLineItemId: '123',
		qty: 10,
		moCount: 0,
		moHours: 0,
		moDays: 0,
		variableId: [123, 345],
		variableValue: '1000',
		takeoffId: 12345
	}
];

const categories = ['Matériaux', 'Main d\'oeuvre', 'Frais', 'Autre']
const types = ['Autre matériaux', 'Autre main d\'oeuvre', 'Autre frais']
const units = ['m2', 'm', 'h', 'j']



export default function TakeoffTable() {
	const { context } = useMonday();
	const { data: mappedLineItems, isLoading: mappedLineItemsLoading } = useMappedLineItems(context?.itemId);

	const [selectedRows, setSelectedRows] = useState({});
	const [editing, setEditing] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleEdit = (takeoffLineItem) => {
		setEditing(takeoffLineItem);
		setDialogOpen(true);
	};

	const handleSave = (updated) => {
		const userIndex = takeoffLineItems.findIndex(
			(u) => u.id === updated.id
		);
		if (userIndex !== -1) {
			takeoffLineItems[userIndex] = updated;
		}
	};

	const handleSelectRow = (id: string, checked: boolean) => {
		setSelectedRows((prev) => ({ ...prev, [id]: checked }));
	};

	// Get unique values for filters
	const getUniqueValues = (field) => {
		return Array.from(
			new Set(
				takeoffLineItems.map((item) => item[field]).filter(Boolean)
			)
		) as string[];
	};

	// Define filter configuration for takeoff line items
	const filterConfig = [
		{
			key: 'category',
			label: 'Category',
			type: 'select',
			options: getUniqueValues('category'),
		},
		{
			key: 'type',
			label: 'Type',
			type: 'select',
			options: getUniqueValues('type'),
		},
		{
			key: 'unit',
			label: 'Unit',
			type: 'select',
			options: getUniqueValues('unit'),
		},
	];

	// Define columns for users (only showing basic info)
	const columns: ColumnDef<any>[] = [
		{
			id: 'select',
			cell: ({ row }) => (
				<div onClick={(e) => e.stopPropagation()}>
					<Checkbox
						checked={
							selectedRows[row.original.id] || false
						}
						onCheckedChange={(value) =>
							handleSelectRow(row.original.id, !!value)
						}
						aria-label="Select row"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: 'name',
			header: 'Name',
			enableSorting: true,
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.name}
					{row.original.skills &&
						row.original.skills.length > 0 && (
							<div className="text-xs text-muted-foreground mt-1">
								{row.original.skills
									.slice(0, 2)
									.join(', ')}
								{row.original.skills.length > 2 &&
									` +${
										row.original.skills.length - 2
									} more`}
							</div>
						)}
				</div>
			),
		},
		{
			accessorKey: 'category',
			header: 'Category',
			enableSorting: true,
		},
		{
			accessorKey: 'type',
			header: 'Type',
			enableSorting: true,
		},
		{
			accessorKey: 'unit',
			header: 'Unit',
			enableSorting: true,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div
					className="flex gap-2"
					onClick={(e) => e.stopPropagation()}
				>
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							console.log(
								'View user details:',
								row.original
							);
						}}
					>
						<EditIcon className="h-4 w-4" />
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => {
							console.log(
								'Delete user:',
								row.original.id
							);
						}}
					>
						<DeleteIcon className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	const handleRowClick = (id: string) => {
		const takeoffLineItem = takeoffLineItems.find((u) => u.id === id);
		if (takeoffLineItem) {
			handleEdit(takeoffLineItem);
		}
	};

	if ( mappedLineItemsLoading ) {
		return (
			<Loading text="Chargement des lignes de devis..." />
		);
	}

	return (
		<>
			<DataTable
				data={mappedLineItems}
				columns={columns}
				isLoading={false}
				selectedRows={selectedRows}
				onRowClick={handleRowClick}
				filterConfig={filterConfig}
				searchPlaceholder="Search by name, email, role..."
				searchableFields={[
					'name',
					'email',
					'role',
					'department',
				]}
				rowHeight={70} // Increased height for additional info
			/>
			<UserEditDialog
				takeoffLineItem={editing}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onSave={handleSave}
				categories={categories}
				types={types}
				units={units}
			/>
		</>
	);
}
