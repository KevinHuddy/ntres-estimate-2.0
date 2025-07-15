'use client';

import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Form,
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';


const formSchema = z.object({
	BOARD_TAKEOFF: z.string(),
    BOARD_LINE_ITEMS: z.string(),
    BOARD_TEMPLATE_LINE_ITEMS: z.string(),
    BOARD_ADMIN_FEES: z.string(),
    BOARD_VARIABLES: z.string(),
    BOARD_QUOTES: z.string(),
    BOARD_CONTRACTS: z.string(),
    BOARD_SUPPLIERS: z.string(),
    BOARD_PRODUCTS: z.string(),
    BOARD_ACTIVITY_CODES: z.string(),
    BOARD_TOOLS: z.string(),

    CATEGORY_TOOLS: z.string(),
    CATEGORY_MO: z.string(),
});

export default function SettingsForm({ initialConfig, debug = false }: { initialConfig: any, debug?: boolean }) {

	const { monday } = useMonday();
	const queryClient = useQueryClient();

	const defaultValues = useMemo(() => {
        return {
            CATEGORY_TOOLS: initialConfig?.CATEGORIES?.TOOLS || "",
            CATEGORY_MO: initialConfig?.CATEGORIES?.MO || "",
        }
    }, [initialConfig])
	
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
            BOARD_TAKEOFF: initialConfig?.BOARDS?.TAKEOFF || "",
            BOARD_LINE_ITEMS: initialConfig?.BOARDS?.LINE_ITEMS || "",
            BOARD_TEMPLATE_LINE_ITEMS: initialConfig?.BOARDS?.TEMPLATE_LINE_ITEMS || "",
            BOARD_ADMIN_FEES: initialConfig?.BOARDS?.ADMIN_FEES || "",
            BOARD_VARIABLES: initialConfig?.BOARDS?.VARIABLES || "",
            BOARD_QUOTES: initialConfig?.BOARDS?.QUOTES || "",
            BOARD_CONTRACTS: initialConfig?.BOARDS?.CONTRACTS || "",
            BOARD_SUPPLIERS: initialConfig?.BOARDS?.SUPPLIERS || "",
            BOARD_PRODUCTS: initialConfig?.BOARDS?.PRODUCTS || "",
            BOARD_ACTIVITY_CODES: initialConfig?.BOARDS?.ACTIVITY_CODES || "",
            BOARD_TOOLS: initialConfig?.BOARDS?.TOOLS || "",
            CATEGORY_TOOLS: initialConfig?.CATEGORIES?.TOOLS || "",
            CATEGORY_MO: initialConfig?.CATEGORIES?.MO || "",
        }
	});

	useEffect(() => {
		form.reset(defaultValues)
	}, [defaultValues, form])

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			// Group the fields under BOARDS
			const config = {
                BOARD_TAKEOFF: values.BOARD_TAKEOFF || "",
                BOARD_LINE_ITEMS: values.BOARD_LINE_ITEMS || "",
                BOARD_TEMPLATE_LINE_ITEMS: values.BOARD_TEMPLATE_LINE_ITEMS || "",
                BOARD_ADMIN_FEES: values.BOARD_ADMIN_FEES || "",
                BOARD_VARIABLES: values.BOARD_VARIABLES || "",
                BOARD_QUOTES: values.BOARD_QUOTES || "",
                BOARD_CONTRACTS: values.BOARD_CONTRACTS || "",
                BOARD_SUPPLIERS: values.BOARD_SUPPLIERS || "",
                BOARD_PRODUCTS: values.BOARD_PRODUCTS || "",
                BOARD_ACTIVITY_CODES: values.BOARD_ACTIVITY_CODES || "",
                BOARD_TOOLS: values.BOARD_TOOLS || "",
                CATEGORY_TOOLS: values.CATEGORY_TOOLS || "",
                CATEGORY_MO: values.CATEGORY_MO || "",
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
					<CardContent className="grid grid-cols-2 gap-y-4 gap-x-6">
						<FormField
							control={form.control}
							name="BOARD_TAKEOFF"
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
							name="BOARD_LINE_ITEMS"
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
							name="BOARD_TEMPLATE_LINE_ITEMS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Takeoff Template
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
							name="BOARD_ADMIN_FEES"
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
							name="BOARD_VARIABLES"
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
							name="BOARD_QUOTES"
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
							name="BOARD_CONTRACTS"
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
							name="BOARD_SUPPLIERS"
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
							name="BOARD_PRODUCTS"
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
							name="BOARD_ACTIVITY_CODES"
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
						<FormField
							control={form.control}
							name="BOARD_TOOLS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Équipements & Outils
									</FormLabel>
									<MondayBoardCombobox
										onSelect={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>

                        <Separator className="col-span-2" />

                        <FormField
							control={form.control}
							name="CATEGORY_TOOLS"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Catégorie Équipements & Outils
									</FormLabel>
									<Input
										onChange={field.onChange}
										value={field.value}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
                        <FormField
							control={form.control}
							name="CATEGORY_MO"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>
										Catégorie Main d&apos;oeuvre
									</FormLabel>
									<Input
										onChange={field.onChange}
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
