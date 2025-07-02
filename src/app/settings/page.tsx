'use client';

import { useContext } from 'react';
import { MondayContext } from '@/components/monday-context-provider';
import {
	Form,
	FormField,
	FormLabel,
	FormControl,
	FormItem,
} from '@/components/ui/form';
import { FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { SearchSelectCombobox } from '@/components/search-select-combobox';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBoards } from '@/hooks/queries/use-boards';
import { Loading } from '@/components/loading';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useColumns } from '@/hooks/queries/use-columns';
import { Label } from '@/components/ui/label';
import { Trash2Icon } from 'lucide-react';

export default function Settings() {
	const { context } = useContext(MondayContext);

	const form = useForm({
		defaultValues: {
			takeoff_board_id: undefined,
			takeoff_fees: [
				{ name: '', column_id: '', activity_code_id: '' },
			],
		},
	});

	const { data: boards, isLoading: boardsLoading } = useBoards();
	const { data: takeoffColumns, isLoading: takeoffColumnsLoading } =
		useColumns(form.watch('takeoff_board_id'), ['numbers']);

	const takeoffFees = useFieldArray({
		control: form.control,
		name: 'takeoff_fees',
	});

	const { formState } = form;
	const { isDirty } = formState;

	const onSubmit = async (data: any) => {
		console.log(data);

		await new Promise((resolve) =>
			setTimeout(resolve, 1000)
		).then(() => {
			toast.success('Configuration sauvegardée');
		});

		// monday.storage.setItem('settings', configString);

		form.reset(data);
	};

	const isAdmin = context?.user?.isAdmin;

	const options =
		boards?.map((board: any) => ({
			value: `${board.id}`,
			label: `${board.name}`,
		})) || [];

	const takeoffColumnsOptions =
		takeoffColumns?.map((column: any) => ({
			value: `${column.id}`,
			label: `${column.title}`,
		})) || [];

	if (context === undefined) {
		return <Loading text="Chargement du contexte monday..." />;
	}

	if (boardsLoading) {
		return <Loading text="Chargement des tableaux..." />;
	}

	if (!isAdmin) {
		return (
			<div>
				Vous devez être administrateur pour accéder à cette
				page
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-[600px] mx-auto">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<Card>
						<CardHeader>
							<CardTitle>Estimation</CardTitle>
						</CardHeader>
						<Separator />
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="takeoff_board_id"
								render={({ field }) => (
									<FormItem className="flex flex-row gap-2">
										<FormLabel className="w-1/5">
											Tableau
										</FormLabel>
										<div className="w-4/5">
											<FormControl>
												<SearchSelectCombobox
													options={options}
													placeholder="Choisir un tableau"
													onSelect={
														field.onChange
													}
													value={
														field.value
													}
												/>
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							{takeoffFees.fields.map(
								(field, index) => (
									<div
										key={field.id}
										className="flex gap-2"
									>
										<div className="w-1/5">
											<Label>Frais {index + 1}</Label>
										</div>
                                        <div className="w-4/5 flex gap-2">

                                            <div className="w-full flex flex-col gap-2">
                                            <FormField
											control={form.control}
											name={`takeoff_fees.${index}.name`}
											render={({ field }) => (
												<FormItem className="flex flex-row gap-2">
													<FormLabel className="w-1/4">
														Nom
													</FormLabel>
													<div className="w-3/4">
														<FormControl>
															<Input
																{...field}
															/>
														</FormControl>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										{takeoffColumnsLoading ||
										takeoffColumnsOptions.length ===
											0 ? (
											<div className="w-3/4">
												<p className="text-sm text-gray-500">
													Aucune colonne
													trouvée
												</p>
											</div>
										) : (
											<FormField
												control={form.control}
												name={`takeoff_fees.${index}.column_id`}
												render={({
													field,
												}) => (
													<FormItem className="flex flex-row gap-2">
														<FormLabel className="w-1/4">
															Colonne
														</FormLabel>
														<div className="w-3/4">
															<FormControl>
																<SearchSelectCombobox
																	options={
																		takeoffColumnsOptions
																	}
																	placeholder="Choisir une colonne"
																	onSelect={
																		field.onChange
																	}
																	value={
																		field.value
																	}
																/>
															</FormControl>
														</div>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}
										<FormField
											control={form.control}
											name={`takeoff_fees.${index}.activity_code_id`}
											render={({ field }) => (
												<FormItem className="flex flex-row gap-2">
													<FormLabel className="w-1/4">
														Code
													</FormLabel>
													<div className="w-3/4">
														<FormControl>
															<Input
																{...field}
															/>
														</FormControl>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
                                            </div>
										
                                        <div className="w-auto flex-shrink-0">
                                            <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        takeoffFees.remove(
                                                            index
                                                        )
                                                    }
                                                >
                                                    <Trash2Icon
                                                        className="w-4 h-4"
                                                    />
                                                </Button>
                                            </div>
									</div>
                                    </div>
								)
							)}
                            
						</CardContent>
						<Separator />
						<CardFooter className="flex justify-end">
							<Button
								type="button"
								size="sm"
								variant="secondary"
								onClick={() =>
									takeoffFees.append({
										name: '',
										column_id: '',
										activity_code_id: '',
									})
								}
							>
								Ajouter frais
							</Button>
						</CardFooter>
					</Card>
					<Button type="submit" disabled={!isDirty}>
						Sauvegarder
					</Button>
				</form>
			</Form>
		</div>
	);
}
