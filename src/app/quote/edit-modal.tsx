'use client';

import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuppliers } from '@/hooks/queries/use-suppliers';
import { useMonday } from '@/components/monday-context-provider';
import { useUpdateLineItemsForQuoteMutation } from '@/hooks/mutations/use-line-items';
import { formatCurrency, getBoardSettings } from '@/lib/utils';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface EditModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: any | null;
}

const schema = z.object({
	name: z.string().min(1, 'Le nom est requis'),
	category: z.string().min(1, 'La catégorie est requise'),
	type: z.string().optional(),
	unit_type: z.string().optional(),
	qty_quote: z.coerce.number().min(0, 'La quantité doit être positive'),
	cost_quote: z.coerce.number().min(0, 'Le prix doit être positif'),
	supplier: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function QuoteEditModal({ open, onOpenChange, item }: EditModalProps) {
	const { context, settings } = useMonday();
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);

	// Fetch data for dropdowns
	const { data: suppliers } = useSuppliers();

	// Mutations
	const updateLineItemMutation = useUpdateLineItemsForQuoteMutation();

	// Initialize form
	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			category: '',
			type: undefined,
			unit_type: undefined,
			qty_quote: 0,
			cost_quote: 0,
			supplier: undefined,
		},
	});

	// Watch for form changes
	const watchedValues = form.watch();
	const { isDirty } = form.formState;
	const isLoading = updateLineItemMutation.isPending;

	// Reset form when item changes
	useEffect(() => {
		if (item) {
			form.reset({
				name: item.name || '',
				category: item.category || '',
				type: item.type || undefined,
				unit_type: item.unit_type || undefined,
				qty_quote: item.qty_quote || 0,
				cost_quote: item.cost_quote || 0,
				supplier: Array.isArray(item.linked_supplier) ? item.linked_supplier[0] || undefined : item.linked_supplier || undefined,
			});
		}
	}, [item, form]);

	// Create dropdown options from existing data
	const dropdownOptions = useMemo(() => {
		// You can get these from your data or define them statically
		const categories = [
			'Matériaux',
			'Main-d\'oeuvre',
			'Équipement',
			'Transport',
			'Autre'
		];
		
		const types = [
			'Standard',
			'Premium',
			'Économique',
			'Spécialisé',
			'Autre'
		];
		
		const unitTypes = [
			'unité',
			'm',
			'm²',
			'm³',
			'kg',
			'L',
			'h',
			'jour',
			'lot'
		];

		return {
			categories,
			types,
			unitTypes,
		};
	}, []);

	// Handle close with dirty check
	const handleClose = () => {
		if (isDirty) {
			setShowCloseConfirm(true);
		} else {
			onOpenChange(false);
		}
	};

	// Confirm close and lose changes
	const handleConfirmClose = () => {
		setShowCloseConfirm(false);
		onOpenChange(false);
		form.reset();
	};

	// Map form data to Monday.com column format
	const mapFormDataToColumns = (data: FormData) => {
		const { cols } = getBoardSettings(settings, 'LINE_ITEMS');

		const columns: any = {
			name: data.name,
			[cols.CATEGORY]: data.category,
			[cols.QTY_QUOTE]: data.qty_quote.toString(),
			[cols.COST_QUOTE]: data.cost_quote.toString(),
		};

		// Add optional fields
		if (data.type) columns[cols.TYPE] = data.type;
		if (data.unit_type) columns[cols.UNIT_TYPE] = data.unit_type;
		if (data.supplier) columns[cols.LINKED_SUPPLIER] = data.supplier;

		return columns;
	};

	// Handle form submission
	const onSubmit = async (data: FormData) => {
		if (!item?.id) {
			toast.error('Erreur: ID de l\'élément manquant');
			return;
		}

		try {
			const columns = mapFormDataToColumns(data);

			await updateLineItemMutation.mutateAsync({
				id: item.id,
				columns,
				quoteId: context?.itemId || '',
			});
			
			toast.success('Élément mis à jour avec succès');
			onOpenChange(false);
		} catch (error) {
			console.error('Error saving line item:', error);
			toast.error('Erreur lors de la sauvegarde');
		}
	};

	if (!item) return null;

	return (
		<>
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Modifier l&apos;élément</DialogTitle>
					</DialogHeader>

                    <Separator />

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								{/* Name */}
								<div className="col-span-2">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nom</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Category */}
								<div>
									<FormField
										control={form.control}
										name="category"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Catégorie</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Sélectionner une catégorie" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{dropdownOptions.categories.map((category: string) => (
															<SelectItem key={category} value={category}>
																{category}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Type */}
								<div>
									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Type</FormLabel>
												<Select onValueChange={field.onChange} value={field.value || ''}>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Sélectionner un type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{dropdownOptions.types.map((type: string) => (
															<SelectItem key={type} value={type}>
																{type}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Unit Type */}
								<div>
									<FormField
										control={form.control}
										name="unit_type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Unité</FormLabel>
												<Select onValueChange={field.onChange} value={field.value || ''}>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Sélectionner une unité" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{dropdownOptions.unitTypes.map((unit: string) => (
															<SelectItem key={unit} value={unit}>
																{unit}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Supplier */}
								<div>
									<FormField
										control={form.control}
										name="supplier"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Fournisseur</FormLabel>
												<Select onValueChange={field.onChange} value={field.value || ''}>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Sélectionner un fournisseur" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{suppliers?.map((supplier: any) => (
															<SelectItem key={supplier.id} value={supplier.id}>
																{supplier.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Quantity */}
								<div>
									<FormField
										control={form.control}
										name="qty_quote"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Quantité</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														placeholder="0"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Cost */}
								<div>
									<FormField
										control={form.control}
										name="cost_quote"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Prix</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														placeholder="0"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

                            <Separator />

							<div className="flex justify-end space-x-2">
                                <div className="rounded-lg mr-auto flex justify-between items-center">
                                    <span className="font-bold leading-none">
                                        {formatCurrency((watchedValues.qty_quote || 0) * (watchedValues.cost_quote || 0))}
                                    </span>
                                </div>
								<Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
									Annuler
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Close confirmation dialog */}
			<AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmer la fermeture</AlertDialogTitle>
						<AlertDialogDescription>
							Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer sans sauvegarder ?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setShowCloseConfirm(false)}>
							Continuer l&apos;édition
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmClose}>
							Fermer sans sauvegarder
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
} 