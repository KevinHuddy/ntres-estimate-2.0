"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useVariables = (takeoffId: string | undefined, options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()
    
    return useQuery({
        queryKey: [QUERY_KEYS.VARIABLES, takeoffId],
        queryFn: async () => {
            const response = await monday.api(`
                query getVariables (
                    $variablesBoardId: [ID!]
                ) {
                    boards(ids: $variablesBoardId) {
                        items_page ( 
                            limit: 500 
                            query_params: {
                                rules: [
                                    {
                                        column_id: "${settings?.COLUMNS?.VARIABLES?.LINKED_TAKEOFF}",
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
                                column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.VARIABLES).flat())}) {
                                    id
                                    ... on TextValue { text }
                                    ... on NumbersValue { number }
                                }
                            }
                        }
                    }
                }`, { 
                    variables: { 
                        variablesBoardId: settings?.BOARDS?.VARIABLES,
                    } 
                }
            )

            const data = response?.data
            
            const variables = data?.boards?.[0]?.items_page?.items?.map((item) => {
                const cols = item?.column_values
                const settingsCols = settings?.COLUMNS?.VARIABLES

                return {
                    id: item?.id,
                    name: item?.name,
                    value: getColValue(cols, settingsCols?.VALUE)?.number || 0,
                    unit: getColValue(cols, settingsCols?.UNIT_TYPE)?.text || "",
                }
            })
            
            return variables
        },
        enabled: !!takeoffId,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}

function getColValue(cols, colId) {
    return cols?.find((col) => col?.id === colId)
}