"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useTakeoffData = (takeoffId: string | undefined): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    return useQuery({
        queryKey: [QUERY_KEYS.TAKEOFF, takeoffId],
        queryFn: async () => {
            const response = await monday.api(`
                query getTakeoffData (
                    $takeoffId: [ID!], 
                    $templateLineItemsBoardId: [ID!], 
                    $lineItemsBoardId: [ID!], 
                ) {
                    takeoff: items(ids: $takeoffId) {
                        id
                        name
                        column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.TAKEOFF).flat())}) {
                            id
                            ... on NumbersValue { 
                                number
                                column {
                                    title
                                }
                            }
                            ... on BoardRelationValue { linked_items { id, name } }
                            ... on MirrorValue { display_value }
                        }
                    }
                    line_items: boards(ids: $lineItemsBoardId) {
                        items_page ( 
                            limit: 500 
                            query_params: {
                                rules: [
                                    {
                                        column_id: "${settings?.COLUMNS?.LINE_ITEMS?.LINKED_TAKEOFF}",
                                        compare_value: "${takeoffId}",
                                        operator: any_of
                                    }
                                ]
                            }
                        ) {
                            cursor
                            items {
                            id
                                name
                            }
                        }
                    }
                    template_line_items: boards(ids: $templateLineItemsBoardId) {
                        items_page ( limit: 500 ) {
                            cursor
                            items {
                                id
                                name
                            }
                        }
                    }
                }`, { 
                    variables: { 
                        takeoffId: [takeoffId],
                        templateLineItemsBoardId: settings?.BOARDS?.TEMPLATE_LINE_ITEMS,
                        lineItemsBoardId: settings?.BOARDS?.LINE_ITEMS,
                    } 
                }
            )

            const data = response?.data
            const takeoff = data?.takeoff?.[0]
            const takeoffCols = takeoff?.column_values
            
            function getColValue(cols, colId) {
                return cols?.find(col => col.id === colId)
            }

            return {
                takeoff_fees: settings?.COLUMNS?.TAKEOFF?.FEE?.map((fee: any) => ({
                    id: fee,
                    value: getColValue(takeoffCols, fee)?.number,
                    name: getColValue(takeoffCols, fee)?.column?.title,
                })),
                project: {
                    id: getColValue(takeoffCols, settings?.COLUMNS?.TAKEOFF?.LINKED_PROJECT)?.linked_items?.[0]?.id,
                    name: getColValue(takeoffCols, settings?.COLUMNS?.TAKEOFF?.LINKED_PROJECT)?.linked_items?.[0].name,
                    number: getColValue(takeoffCols, settings?.COLUMNS?.TAKEOFF?.LINKED_PROJECT_NUMBER)?.display_value,
                }
            }
        },
        enabled: !!takeoffId,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
    })
}