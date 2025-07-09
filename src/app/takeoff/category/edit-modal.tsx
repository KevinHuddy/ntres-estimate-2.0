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
import { useTemplateLineItems } from '@/hooks/queries/use-template-line-items';
import { useVariables } from '@/hooks/queries/use-variables';
import { useMonday } from '@/components/monday-context-provider';
import { useCreateLineItemsMutation, useUpdateLineItemsMutation } from '@/hooks/mutations/use-line-items';
import { getBoardSettings } from '@/lib/utils';
import { toast } from 'sonner';

interface EditModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: any | null;
}

const schema = z.object({
	name: z.string().min(1, 'Le nom est requis'),
	category: z.string().min(1, 'La catégorie est requise'),
	type: z.string().min(1, 'Le type est requis'),
	unit_type: z.string().min(1, "L'unité est requise"),
	qty_takeoff: z.coerce.number().min(0, 'La quantité doit être positive'),
	cost_takeoff: z.coerce.number().min(0, 'Le prix doit être positif'),
	supplier: z.string().min(1, 'Le fournisseur est requis'),
	variables: z.array(z.string()).default([]),
	waste: z.coerce.number().min(0, 'Le déchet doit être positif'),
	multiplier: z.coerce.number().min(0, 'Le multiplicateur doit être positif'),
	divider: z.coerce.number().min(0, 'Le diviseur doit être positif'),
	// MO fields for "main d'oeuvre" type
	mo_qty: z.coerce.number().min(0, 'La quantité MO doit être positive'),
	mo_hours: z.coerce.number().min(0, 'Les heures MO doivent être positives'),
	mo_days: z.coerce.number().min(0, 'Les jours MO doivent être positifs'),
	// Activity code field
	activity_code: z.string().min(1, "Le code d&apos;activité est requis"),
});

type FormData = z.infer<typeof schema>;

export default function EditModal({ open, onOpenChange, item }: EditModalProps) {
	const { context, settings } = useMonday();
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);

	// Fetch data for dropdowns
	const { data: suppliers } = useSuppliers();
	const { data: templateLineItems } = useTemplateLineItems();
	const { data: variables } = useVariables(context?.itemId);

	// Mutations
	const createLineItemMutation = useCreateLineItemsMutation();
	const updateLineItemMutation = useUpdateLineItemsMutation();

	// Initialize form
	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			category: '',
			type: '',
			unit_type: '',
			qty_takeoff: 0,
			cost_takeoff: 0,
			supplier: '',
			variables: [],
			waste: 0,
			multiplier: 0,
			divider: 0,
			mo_qty: 0,
			mo_hours: 0,
			mo_days: 0,
			activity_code: '',
		},
	});

	// Reset form when item changes
	useEffect(() => {
		if (item) {
			form.reset({
				name: item.name || '',
				category: item.category || '',
				type: item.type || '',
				unit_type: item.unit_type || '',
				qty_takeoff: item.qty_takeoff || 0,
				cost_takeoff: item.cost_takeoff || 0,
				supplier: Array.isArray(item.linked_supplier) ? item.linked_supplier[0] || '' : item.linked_supplier || '',
				variables: item.values || [],
				waste: item.waste || 0,
				multiplier: item.multiplier || 0,
				divider: item.divider || 0,
				mo_qty: item.mo_qty || 0,
				mo_hours: item.mo_hours || 0,
				mo_days: item.mo_days || 0,
				activity_code: Array.isArray(item.linked_activity_code) ? item.linked_activity_code[0] || '' : item.linked_activity_code || '',
			});
		}
	}, [item, form]);

	// Extract unique options from template line items
	const dropdownOptions = useMemo(() => {
		if (!templateLineItems) return { categories: [], types: [], units: [], activityCodes: [] };

		const categories = [...new Set(templateLineItems.map((item) => item.category).filter(Boolean))].sort();
		const types = [...new Set(templateLineItems.map((item) => item.type).filter(Boolean))].sort();
		const units = [...new Set(templateLineItems.map((item) => item.unit_type).filter(Boolean))].sort();
		
		// Extract activity codes from linked_activity_code.linked_items
		const activityCodes = [...new Set(
			templateLineItems
				.flatMap((item) => item.linked_activity_code?.linked_items || [])
				.filter(Boolean)
				.map((linkedItem: any) => ({ id: linkedItem.id, name: linkedItem.name }))
		)].sort((a: any, b: any) => a.name.localeCompare(b.name));

		return { categories, types, units, activityCodes };
	}, [templateLineItems]);

	// Watch form for dirty state and loading states
	const watchedValues = form.watch();
	const isDirty = form.formState.isDirty;
	const isLoading = createLineItemMutation.isPending || updateLineItemMutation.isPending;

	// Calculate variables total
	const variablesTotal = useMemo(() => {
		if (!watchedValues.variables || !variables) return 0;
		return watchedValues.variables.reduce((total: number, variableId: string) => {
			const variable = variables.find((v: any) => v.id === variableId);
			return total + (variable?.value || 0);
		}, 0);
	}, [watchedValues.variables, variables]);

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
		const { cols } = getBoardSettings(settings, "LINE_ITEMS");
		
		return {
			[cols.CATEGORY]: data.category,
			[cols.TYPE]: data.type,
			[cols.UNIT_TYPE]: data.unit_type,
			[cols.QTY_TAKEOFF]: data.qty_takeoff.toString(),
			[cols.COST_TAKEOFF]: data.cost_takeoff.toString(),
			[cols.LINKED_SUPPLIER]: data.supplier,
			[cols.VALUES]: data.variables?.length ? data.variables.join(',') : '',
			[cols.WASTE]: data.waste.toString(),
			[cols.MULTIPLIER]: data.multiplier.toString(),
			[cols.DIVIDER]: data.divider.toString(),
			[cols.MO_QTY]: data.mo_qty.toString(),
			[cols.MO_HOURS]: data.mo_hours.toString(),
			[cols.MO_DAYS]: data.mo_days.toString(),
			[cols.LINKED_ACTIVITY_CODE]: data.activity_code,
			[cols.LINKED_TEMPLATE_LINE_ITEM]: item?.linked_template_line_item || '',
		};
	};

	// Handle form submission
	const onSubmit = async (data: FormData) => {
		try {
			const columns = mapFormDataToColumns(data);
			
			if (item?.id) {
				// Update existing line item
				await updateLineItemMutation.mutateAsync({
					id: item.id,
					columns,
					takeoffId: context?.itemId || '',
				});
				toast.success('Élément mis à jour avec succès');
			} else {
				// Create new line item
				await createLineItemMutation.mutateAsync({
					name: data.name,
					columns,
					takeoffId: context?.itemId || '',
				});
				
				// The mutation will automatically invalidate the queries, which will update the state
				toast.success('Nouvel élément créé avec succès');
			}
			
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
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Modifier l&apos;élément</DialogTitle>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							{/* Name */}
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

							<div className="grid grid-cols-2 gap-4">
								<div>
									{/* Category */}
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
								<div>
									{/* Type */}
									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Type</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
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
								<div>
									{/* Unit Type */}
									<FormField
										control={form.control}
										name="unit_type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Unité</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Sélectionner une unité" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{dropdownOptions.units.map((unit: string) => (
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
								<div>
									{/* Activity Code */}
									<FormField
										control={form.control}
										name="activity_code"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Code d&apos;activité</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Sélectionner un code" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{dropdownOptions.activityCodes.map((activityCode: any) => (
															<SelectItem key={activityCode.id} value={activityCode.id}>
																{activityCode.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div>
									{/* Supplier */}
									<FormField
										control={form.control}
										name="supplier"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Fournisseur</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
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
							</div>

							{/* Conditional inputs based on type */}
							{watchedValues.category === "Main-d'oeuvre" ? (
								<div className="grid grid-cols-3 gap-4">
									<div>
										{/* MO Quantity */}
										<FormField
											control={form.control}
											name="mo_qty"
											render={({ field }) => (
												<FormItem>
													<FormLabel>MO QTY</FormLabel>
													<FormControl>
														<Input
															type="number"
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
									<div>
										{/* MO Hours */}
										<FormField
											control={form.control}
											name="mo_hours"
											render={({ field }) => (
												<FormItem>
													<FormLabel>HOURS</FormLabel>
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
									<div>
										{/* MO Days */}
										<FormField
											control={form.control}
											name="mo_days"
											render={({ field }) => (
												<FormItem>
													<FormLabel>DAYS</FormLabel>
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
							) : (
								<div className="grid grid-cols-2 gap-4">
									<div>
										{/* Quantity */}
										<FormField
											control={form.control}
											name="qty_takeoff"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Quantité</FormLabel>
													<FormControl>
														<Input
															type="number"
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
									<div>
										{/* Cost */}
										<FormField
											control={form.control}
											name="cost_takeoff"
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
							)}

							{/* Variables */}
							<FormField
								control={form.control}
								name="variables"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Variables</FormLabel>
											{variablesTotal > 0 && (
												<span className="text-sm text-muted-foreground">Total: {variablesTotal.toFixed(2)}</span>
											)}
										</div>
										<Select
											onValueChange={(value) => {
												if (value && !field.value?.includes(value)) {
													field.onChange([...field.value, value]);
												}
											}}
											value=""
										>
											<FormControl>
											<SelectTrigger className="w-full">
													<SelectValue placeholder="Sélectionner une variable" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{variables?.map((variable: any) => (
													<SelectItem
														key={variable.id}
														value={variable.id}
														disabled={field.value?.includes(variable.id)}
													>
														<div className="flex items-center justify-between w-full">
															<span>{variable.name}</span>
															<span className="text-muted-foreground ml-2">
																{variable.value?.toFixed(2) || '0.00'}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										{/* Display selected variables */}
										{field.value && field.value.length > 0 && (
											<div className="flex flex-wrap gap-2 mt-2">
												{field.value.map((variableId: string) => {
													const variable = variables?.find((v: any) => v.id === variableId);
													return (
														<div
															key={variableId}
															className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
														>
															<span>{variable?.name}</span>
															<span className="text-muted-foreground">
																({variable?.value?.toFixed(2) || '0.00'})
															</span>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
																onClick={() => {
																	field.onChange(field.value?.filter((id: string) => id !== variableId));
																}}
															>
																×
															</Button>
														</div>
													);
												})}
											</div>
										)}

										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-3 gap-4">
								<div>
									{/* Waste */}
									<FormField
										control={form.control}
										name="waste"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pertes</FormLabel>
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
								<div>
									{/* Multiplier */}
									<FormField
										control={form.control}
										name="multiplier"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Multiplicateur</FormLabel>
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
								<div>
									{/* Divider */}
									<FormField
										control={form.control}
										name="divider"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Diviseur</FormLabel>
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

							<div className="flex justify-end space-x-2 pt-4">
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
						<AlertDialogTitle>Modifications non sauvegardées</AlertDialogTitle>
						<AlertDialogDescription>
							Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer sans sauvegarder ?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Continuer l&apos;édition</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmClose}>Fermer sans sauvegarder</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
