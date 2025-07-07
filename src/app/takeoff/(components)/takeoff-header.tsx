import { Loading } from "@/components/loading";
import { useMonday } from "@/components/monday-context-provider";
import { useTakeoffData } from "@/hooks/queries/use-takeoff";

export default function TakeoffHeader() {
	const { context } = useMonday();
	const { data: takeoff, isLoading: takeoffLoading } = useTakeoffData(context?.itemId);
	// const { data: mappedLineItems, isLoading: mappedLineItemsLoading } = useMappedLineItems(context?.itemId);

    if ( takeoffLoading ) {
		return (
			<Loading text="Chargement des données du devis..." />
		);
	}
	return (
		<div>
			<h1>{takeoff?.project?.name}</h1>
			<pre>{JSON.stringify(takeoff, null, 2)}</pre>
		</div>
	);
}
