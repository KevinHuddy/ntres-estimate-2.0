'use client';

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FilterBar } from './filter-bar';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useClickOutside } from '@/hooks/use-click-outside';

interface OptimizedVirtualTableProps<TData> {
	data: TData[];
	columns: ColumnDef<TData>[];
	isLoading?: boolean;
	error?: any;
	editingRow?: string | null;
	selectedRows?: Record<string, boolean>;
	onRowClick?: (id: string) => void;
	onEditingChange?: (id: string | null) => void;
	filterConfig?: any;
	searchPlaceholder?: string;
	searchableFields?: (keyof TData)[];
	loadingMessage?: string;
	errorMessage?: string;
	emptyMessage?: string;
	rowHeight?: number;
}

export function DataTable<TData extends { id: string }>({
	data,
	columns,
	isLoading = false,
	error,
	editingRow,
	selectedRows = {},
	onRowClick,
	onEditingChange,
	filterConfig = [],
	searchPlaceholder = 'Search...',
	searchableFields = [],
	loadingMessage = 'Loading...',
	errorMessage = 'Error loading data',
	emptyMessage = 'No results.',
	rowHeight = 60,
}: OptimizedVirtualTableProps<TData>) {
	const [columnFilters, setColumnFilters] =
		useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState('');

	// Debounce the global filter to improve search performance
	const debouncedGlobalFilter = useDebouncedValue(
		globalFilter,
		300
	);

	// Handle click outside to close editing
	const tableRef = useClickOutside<HTMLDivElement>(
		useCallback(() => {
			if (editingRow && onEditingChange) {
				onEditingChange(null);
			}
		}, [editingRow, onEditingChange]),
		!!editingRow // Only enable when editing
	);

	// Memoize the global filter function for better performance
	const globalFilterFn = useCallback(
		(row: any, columnId: string, value: string) => {
			if (!value) return true;

			const searchValue = value.toLowerCase();
			return searchableFields.some((field) => {
				const cellValue = row.getValue(field as string);
				return cellValue
					?.toString()
					.toLowerCase()
					.includes(searchValue);
			});
		},
		[searchableFields]
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn,
		state: {
			columnFilters,
			globalFilter: debouncedGlobalFilter, // Use debounced value for filtering
		},
	});

	const { rows } = table.getRowModel();

	// Virtualization setup with optimized settings
	const tableContainerRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: useCallback(() => rowHeight, [rowHeight]),
		overscan: 20, // Increased overscan for smoother scrolling
		measureElement: undefined, // Disable dynamic measurement for better performance
	});

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	const paddingTop =
		virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
	const paddingBottom =
		virtualRows.length > 0
			? totalSize -
			  (virtualRows?.[virtualRows.length - 1]?.end || 0)
			: 0;

	// Memoize column widths for consistent rendering
	const columnWidths = useMemo(() => {
		const totalColumns = columns.length;
		return columns.map((_, index) => {
			if (index === 0) return 60; // Checkbox column
			if (index === totalColumns - 1) return 140; // Actions column
			return 160; // Regular columns
		});
	}, [columns.length]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">{loadingMessage}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-destructive">
					{errorMessage}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4" ref={tableRef}>
			{/* Filters */}
			<FilterBar
				table={table}
				filterConfig={filterConfig}
				globalFilter={globalFilter} // Use immediate value for input
				onGlobalFilterChange={setGlobalFilter}
				searchPlaceholder={searchPlaceholder}
			/>

			{/* Stats */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<div>
					Showing {rows.length} of {data.length} items
					{debouncedGlobalFilter && ` (filtered)`}
				</div>
				<div className="flex items-center gap-2">
					<span>
						Optimized virtual rendering •{' '}
						{virtualRows.length} visible rows
					</span>
					{editingRow && (
						<span className="text-blue-600 font-medium">
							• Editing mode (click outside to close)
						</span>
					)}
				</div>
			</div>

			{/* Virtual Table */}
			<div className="rounded-md border bg-background">
				{/* Fixed Header */}
				<div className="border-b bg-muted/50">
					<div className="flex">
						{table.getHeaderGroups().map((headerGroup) =>
							headerGroup.headers.map(
								(header, index) => (
									<div
										key={header.id}
										className="flex items-center px-4 py-3 font-medium border-r last:border-r-0 bg-background"
										style={{
											width: columnWidths[
												index
											],
											minWidth:
												columnWidths[index],
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column
														.columnDef
														.header,
													header.getContext()
											  )}
									</div>
								)
							)
						)}
					</div>
				</div>

				{/* Virtual Table Body */}
				<div
					ref={tableContainerRef}
					className="relative overflow-auto"
					style={{
						height: `${Math.min(
							600,
							Math.max(400, totalSize)
						)}px`,
					}}
				>
					{rows.length === 0 ? (
						<div className="flex items-center justify-center h-32">
							<div className="text-center text-muted-foreground">
								{emptyMessage}
							</div>
						</div>
					) : (
						<div
							style={{
								height: `${totalSize}px`,
								width: '100%',
								position: 'relative',
							}}
						>
							{paddingTop > 0 && (
								<div
									style={{
										height: `${paddingTop}px`,
									}}
								/>
							)}

							{virtualRows.map((virtualRow) => {
								const row = rows[virtualRow.index];
								const isSelected =
									selectedRows[row.original.id];
								const isEditing =
									editingRow === row.original.id;

								return (
									<div
										key={row.id}
										className={`absolute top-0 left-0 w-full border-b transition-colors hover:bg-muted/50 ${
											isEditing
												? 'bg-muted/70 ring-2 ring-blue-200'
												: ''
										} ${
											isSelected
												? 'bg-muted/30'
												: ''
										}`}
										style={{
											height: `${rowHeight}px`,
											transform: `translateY(${virtualRow.start}px)`,
										}}
										onClick={() =>
											onRowClick?.(
												row.original.id
											)
										}
									>
										<div className="flex items-center h-full cursor-pointer">
											{row
												.getVisibleCells()
												.map(
													(
														cell,
														cellIndex
													) => (
														<div
															key={
																cell.id
															}
															className="flex items-center px-4 py-2 border-r last:border-r-0 overflow-hidden"
															style={{
																width: columnWidths[
																	cellIndex
																],
																minWidth:
																	columnWidths[
																		cellIndex
																	],
															}}
														>
															<div className="truncate w-full">
																{flexRender(
																	cell
																		.column
																		.columnDef
																		.cell,
																	cell.getContext()
																)}
															</div>
														</div>
													)
												)}
										</div>
									</div>
								);
							})}

							{paddingBottom > 0 && (
								<div
									style={{
										height: `${paddingBottom}px`,
									}}
								/>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Selected rows info */}
			{Object.values(selectedRows).some(Boolean) && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						{
							Object.values(selectedRows).filter(
								Boolean
							).length
						}{' '}
						of {rows.length} row(s) selected.
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							console.log(`bulk actions`, selectedRows);
						}}
					>
						Bulk Actions
					</Button>
				</div>
			)}
		</div>
	);
}
