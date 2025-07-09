'use client';

import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useMonday } from '@/components/monday-context-provider';

import { MondayBoardCombobox } from './fields';
import { QUERY_KEYS } from '@/utils/constants';
import { useQueryClient } from '@tanstack/react-query';


const formSchema = z.object({
	TAKEOFF: z.string(),
	LINE_ITEMS: z.string(),
	TEMPLATE_LINE_ITEMS: z.string(),
	ADMIN_FEES: z.string(),
	VARIABLES: z.string(),
	QUOTES: z.string(),
	CONTRACTS: z.string(),
	SUPPLIERS: z.string(),
	PRODUCTS: z.string(),
	ACTIVITY_CODES: z.string(),
});

export default function SettingsForm({ initialConfig, debug = false }: { initialConfig: any, debug?: boolean }) {

	const { monday } = useMonday();
	const queryClient = useQueryClient();

	const defaultValues = useMemo(() => initialConfig?.BOARDS || {}, [initialConfig])
	
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: defaultValues
	});

	useEffect(() => {
		form.reset(defaultValues)
	}, [defaultValues, form])

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			// Group the fields under BOARDS
			const config = {
				BOARDS: {
					TAKEOFF: values.TAKEOFF,
					LINE_ITEMS: values.LINE_ITEMS,
					TEMPLATE_LINE_ITEMS: values.TEMPLATE_LINE_ITEMS,
					ADMIN_FEES: values.ADMIN_FEES,
					VARIABLES: values.VARIABLES,
					QUOTES: values.QUOTES,
					CONTRACTS: values.CONTRACTS,
					SUPPLIERS: values.SUPPLIERS,
					PRODUCTS: values.PRODUCTS,
					ACTIVITY_CODES: values.ACTIVITY_CODES,
				}
			};

			await monday.storage.setItem('config', JSON.stringify(config));
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });

			if (debug) {
				toast(
					<pre className="w-[320px] rounded-md bg-slate-950 p-4">
						<code className="text-white w-auto whitespace-pre-wrap">
							{JSON.stringify(config, null, 2)}
						</code>
					</pre>
				);
			} else {
				toast.success('Config saved');	
			}
			
		} catch (error) {
			console.error('Form submission error', error);
			toast.error(
				'Failed to submit config.'
			);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card>
					<CardHeader>
						<CardTitle>Tableaux</CardTitle>
					</CardHeader>
					<CardContent className="space-y-8">
						<FormField
							control={form.control}
							name="TAKEOFF"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Takeoff
									</FormLabel>
									<MondayBoardCombobox
										onSelect={
											field.onChange
										}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="LINE_ITEMS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Éléments</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="TEMPLATE_LINE_ITEMS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Takeoff Template
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormDescription>
										Le tableau ou le templates du
										takeoff est sauvegardé
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="ADMIN_FEES"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Frais administratifs
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="VARIABLES"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Variables Takeoff
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="QUOTES"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Soumissions
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="CONTRACTS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Contrats
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="SUPPLIERS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Fournisseurs
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="PRODUCTS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Produits
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="ACTIVITY_CODES"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Code d&apos;activité
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>
				<div className="flex justify-end gap-2 mt-4">
					<Button disabled={!form.formState.isDirty} type="submit">Sauvegarder</Button>
				</div>
			</form>
		</Form>
	);
}
