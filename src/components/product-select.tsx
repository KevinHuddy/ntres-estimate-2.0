'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, ChevronDown } from 'lucide-react';
import { useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandInput,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useProducts } from '@/hooks/queries/use-products';

// Virtualized command item component
const VirtualizedCommandItem = ({ index, style, data }: any) => {
	const { filteredOptions, onSelect, selectedValue } = data;
	const option = filteredOptions[index];

	return (
		<div
			style={style}
			className={cn(
				'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				selectedValue === option.value ? 'bg-accent text-accent-foreground' : ''
			)}
			onClick={() => onSelect(option)}
		>
			{option.label}
			<Check
				className={cn(
					'ml-auto h-4 w-4',
					selectedValue === option.value ? 'opacity-100' : 'opacity-0'
				)}
			/>
		</div>
	);
};

interface ProductSelectProps {
	placeholder?: string;
	onSelect: (product: any) => void;
	value?: string | number;
	searchPlaceholder?: string;
	className?: string;
}

export const ProductSelect = React.memo(
	({
		placeholder = "Sélectionner un produit",
		onSelect,
		value,
		searchPlaceholder = "Rechercher un produit...",
		className,
	}: ProductSelectProps) => {
		const [open, setOpen] = useState(false);
		const [searchTerm, setSearchTerm] = useState('');

		// Fetch products
		const { data: products, isLoading } = useProducts();

		// Convert products to options format
		const options = useMemo(() => {
			if (!products) return [];
			return products.map((product: any) => ({
				value: product.id,
				label: product.name,
				product: product // Keep full product data for onSelect
			}));
		}, [products]);

		const handleSelect = useCallback(
			(option: { value: string; product: any }) => {
				onSelect(option.product);
				setOpen(false);
				setSearchTerm('');
			},
			[onSelect]
		);

		const handleOpenChange = useCallback((open: boolean) => {
			setOpen(open);
			if (!open) {
				setSearchTerm('');
			}
		}, []);

		const selectedOption = useMemo(
			() => options?.find((option) => option.value === value),
			[options, value]
		);

		const filteredOptions = useMemo(() => {
			if (!searchTerm || !options) return options || [];
			return options.filter((option) =>
				option.label.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}, [options, searchTerm]);

		const handleSearchChange = useCallback((search: string) => {
			setSearchTerm(search);
		}, []);

		if (isLoading) {
			return (
				<Button
					variant="outline"
					className={cn("w-full justify-between bg-transparent", className)}
					disabled
				>
					<div className="flex items-center">
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						Chargement des produits...
					</div>
					<ChevronDown
						className={`w-4 h-4 opacity-50 transition-transform`}
					/>
				</Button>
			);
		}

		return (
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn("w-full justify-between", className)}
					>
						{selectedOption?.label || placeholder}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder={searchPlaceholder}
							className="h-9"
							value={searchTerm}
							onValueChange={handleSearchChange}
						/>
						<div className="max-h-60 overflow-hidden">
							{filteredOptions.length > 0 ? (
								<List
									height={Math.min(240, filteredOptions.length * 35)}
									itemCount={filteredOptions.length}
									itemSize={35}
									width="300px"
									itemData={{
										filteredOptions,
										onSelect: handleSelect,
										selectedValue: value,
									}}
								>
									{VirtualizedCommandItem}
								</List>
							) : (
								<CommandEmpty>
									Aucun produit trouvé.
								</CommandEmpty>
							)}
						</div>
					</Command>
				</PopoverContent>
			</Popover>
		);
	}
);

ProductSelect.displayName = 'ProductSelect'; 