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
import { useActivityCodes } from '@/hooks/queries/use-activity-codes';
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
	type: z.string().optional(),
	unit_type: z.string().optional(),
	qty_takeoff: z.coerce.number().min(0, 'La quantité doit être positive'),
	cost_takeoff: z.coerce.number().min(0, 'Le prix doit être positif'),
	supplier: z.string().optional(),
	variables: z.array(z.string()).default([]),
	waste: z.coerce.number().min(0, 'Le déchet doit être positif').optional(),
	multiplier: z.coerce.number().min(0, 'Le multiplicateur doit être positif').optional(),
	divider: z.coerce.number().min(0, 'Le diviseur doit être positif').optional(),
	// MO fields for "main d'oeuvre" type
	mo_qty: z.coerce.number().min(1, "Le nombre d'hommes doit être positif").optional(),
	mo_hours: z.coerce.number().min(0.01, 'Les heures sont requises et doivent être positives').optional(),
	mo_days: z.coerce.number().min(1, 'Les jours doivent être positifs').optional(),
	// Activity code field
	activity_code: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditModal({ open, onOpenChange, item }: EditModalProps) {
	const { context, settings } = useMonday();
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);

	// Fetch data for dropdowns
	const { data: suppliers } = useSuppliers();
	const { data: activityCodes } = useActivityCodes();
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
			type: undefined,
			unit_type: undefined,
			qty_takeoff: 0,
			cost_takeoff: 0,
			supplier: undefined,
			variables: [],
			waste: 0,
			multiplier: 0,
			divider: 0,
			mo_qty: 1,
			mo_hours: 8,
			mo_days: 1,
			activity_code: undefined,
		},
	});

	// Reset form when item changes
	useEffect(() => {
		if (item) {
			form.reset({
				name: item.name || '',
				category: item.category || '',
				type: item.type || undefined,
				unit_type: item.unit_type || undefined,
				qty_takeoff: item.qty_takeoff || 0,
				cost_takeoff: item.cost_takeoff || 0,
				supplier: Array.isArray(item.linked_supplier) ? item.linked_supplier[0] || undefined : item.linked_supplier || undefined,
				variables: item.values || [],
				waste: item.waste || 0,
				multiplier: item.multiplier || 0,
				divider: item.divider || 0,
				mo_qty: item.mo_qty || 1,
				mo_hours: item.mo_hours || 8,
				mo_days: item.mo_days || 1,
				activity_code: Array.isArray(item.linked_activity_code)
					? item.linked_activity_code[0] || undefined
					: item.linked_activity_code || undefined,
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
		const activityCodes = [
			...new Set(
				templateLineItems
					.flatMap((item) => item.linked_activity_code?.linked_items || [])
					.filter(Boolean)
					.map((linkedItem: any) => ({ id: linkedItem.id, name: linkedItem.name }))
			),
		].sort((a: any, b: any) => a.name.localeCompare(b.name));

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

	// Calculate quantity based on variables and formula
	const calculatedQuantity = useMemo(() => {
		if (watchedValues.category === "Main-d'oeuvre") {
			// For Main-d'oeuvre: mo_qty × mo_days × mo_hours
			const moQty = watchedValues.mo_qty || 1; // Default to 1 if not set
			const moDays = watchedValues.mo_days || 1; // Default to 1 if not set
			const moHours = watchedValues.mo_hours || 0; // Must be defined, no default

			if (moHours <= 0) return null; // mo_hours is required

			return moQty * moDays * moHours;
		} else {
			// For other categories: variable total + ( variable total * waste / 100 ) * multiplier / divider
			if (variablesTotal <= 0) return null;

			const waste = watchedValues.waste || 0;
			const multiplier = watchedValues.multiplier || 1;
			const divider = watchedValues.divider || 1;

			const wasteAmount = variablesTotal * (waste / 100);
			const totalWithWaste = variablesTotal + wasteAmount;
			const finalQuantity = (totalWithWaste * multiplier) / divider;

			return finalQuantity;
		}
	}, [
		watchedValues.category,
		watchedValues.mo_qty,
		watchedValues.mo_days,
		watchedValues.mo_hours,
		variablesTotal,
		watchedValues.waste,
		watchedValues.multiplier,
		watchedValues.divider,
	]);

	// Update quantity field when calculated quantity changes
	useEffect(() => {
		if (calculatedQuantity !== null) {
			if (watchedValues.category === "Main-d'oeuvre" || watchedValues.variables?.length > 0) {
				form.setValue('qty_takeoff', calculatedQuantity);
			}
		}
	}, [calculatedQuantity, form, watchedValues.category, watchedValues.variables?.length]);

	// Check if quantity should be disabled
	const isQuantityDisabled = watchedValues.category === "Main-d'oeuvre" || watchedValues.variables?.length > 0;

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
			[cols.CATEGORY]: data.category,
			[cols.QTY_TAKEOFF]: data.qty_takeoff.toString(),
			[cols.COST_TAKEOFF]: data.cost_takeoff.toString(),
			[cols.LINKED_TEMPLATE_LINE_ITEM]: item?.linked_template_line_item || '',
            [cols.TYPE]: data.type,
		};

		// Add conditional fields based on category
		if (data.category === "Main-d'oeuvre") {
			// For Main-d'oeuvre, only add MO-specific fields
			if (data.mo_qty !== undefined) columns[cols.MO_QTY] = data.mo_qty.toString();
			if (data.mo_hours !== undefined) columns[cols.MO_HOURS] = data.mo_hours.toString();
			if (data.mo_days !== undefined) columns[cols.MO_DAYS] = data.mo_days.toString();
		} else {
			// For other categories, add standard fields
			if (data.unit_type) columns[cols.UNIT_TYPE] = data.unit_type;
			if (data.supplier) columns[cols.LINKED_SUPPLIER] = data.supplier;
			if (data.variables?.length) columns[cols.VALUES] = data.variables;
			if (data.waste !== undefined) columns[cols.WASTE] = data.waste.toString();
			if (data.multiplier !== undefined) columns[cols.MULTIPLIER] = data.multiplier.toString();
			if (data.divider !== undefined) columns[cols.DIVIDER] = data.divider.toString();
		}

		// Activity code is always optional
		if (data.activity_code) {
			columns[cols.LINKED_ACTIVITY_CODE] = data.activity_code;
		}

		return columns;
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

                    <pre className="text-xs text-muted-foreground">
                        {JSON.stringify(settings, null, 2)}
                    </pre>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-6 gap-6">
								<div className="col-span-3">
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
								</div>
								<div className="col-span-3">
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
								<div className="col-span-3">
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
								{watchedValues.category === "Main-d'oeuvre" || (
									<>
										<div className="col-span-3">
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
										<div className="col-span-3">
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
									</>
								)}
								<div className="col-span-3">
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
														{activityCodes?.map((activityCode: any) => (
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

							{/* Conditional inputs based on type */}
							{watchedValues.category === "Main-d'oeuvre" ? (
								<div className="grid grid-cols-3 gap-4 col-span-6">
									<div>
										{/* MO Quantity - Hommes */}
										<FormField
											control={form.control}
											name="mo_qty"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Hommes</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder="1"
															{...field}
															value={field.value || ''}
															onChange={(e) =>
																field.onChange(e.target.value === '' ? 1 : Number(e.target.value))
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div>
										{/* MO Hours - Heures (Required) */}
										<FormField
											control={form.control}
											name="mo_hours"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Heures *</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.01"
															placeholder="8"
															{...field}
															value={field.value || ''}
															onChange={(e) =>
																field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div>
										{/* MO Days - Jours */}
										<FormField
											control={form.control}
											name="mo_days"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Jours</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.01"
															placeholder="1"
															{...field}
															value={field.value || ''}
															onChange={(e) =>
																field.onChange(e.target.value === '' ? 1 : Number(e.target.value))
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							) : (
								<div className="col-span-3">
										{/* Quantity */}
										<FormField
											control={form.control}
											name="qty_takeoff"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Quantité
														{isQuantityDisabled && (
															<span className="text-xs text-muted-foreground ml-2">
																(Variables)
															</span>
														)}
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder="0"
															{...field}
															disabled={isQuantityDisabled}
															value={field.value || ''}
															onChange={(e) =>
																field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
															}
														/>
													</FormControl>
													{/* {isQuantityDisabled && calculatedQuantity !== null && (
														<div className="text-xs text-muted-foreground mt-1">
															{watchedValues.category === "Main-d'oeuvre"
																? `Calculé: ${watchedValues.mo_qty || 1} × ${
																		watchedValues.mo_days || 1
																  } × ${watchedValues.mo_hours || 0} = ${calculatedQuantity.toFixed(2)}`
																: `Calculé: ${variablesTotal.toFixed(2)} + (${variablesTotal.toFixed(
																		2
																  )} × ${watchedValues.waste || 0}%) × ${watchedValues.multiplier || 1} ÷ ${
																		watchedValues.divider || 1
																  } = ${calculatedQuantity.toFixed(2)}`}
														</div>
													)} */}
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
							)}

							<div className="col-span-3">
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

							{/* Variables - Hidden for Main-d'oeuvre */}
							{watchedValues.category !== "Main-d'oeuvre" && (
								<>
								<div className="col-span-6 border-t pt-6 mt-2">
								<FormField
									control={form.control}
									name="variables"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center justify-between">
												<FormLabel>Variables</FormLabel>
												{variablesTotal > 0 && (
													<span className="text-sm text-muted-foreground">
														Total: {variablesTotal.toFixed(2)}
													</span>
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
																		field.onChange(
																			field.value?.filter((id: string) => id !== variableId)
																		);
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
								</div>
								<div className="col-span-2">
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
								<div className="col-span-2">
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
								<div className="col-span-2">
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
							</>
								
							)}
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
