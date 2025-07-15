"use client"

import { CACHE_TIMES, LIMITS, QUERY_KEYS } from "@/utils/constants"
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
                    complexity {
                        before
                        query
                    }
                    boards(ids: $variablesBoardId) {
                        items_page ( 
                            limit: ${LIMITS.VARIABLES}
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
            console.log(`🏋️‍♂️ Complexity Use Variables: ${JSON.stringify(data?.complexity)}`)
            let cursor = data?.boards?.[0]?.items_page?.cursor
            
            const items = []
            items.push(...data?.boards?.[0]?.items_page?.items)

            while (cursor) {
                const response = await monday.api(`
                    query getNextVariables (
                        $cursor: String!
                    ) {
                        complexity {
                            before
                            query
                        }
                        next_items_page(limit: ${LIMITS.VARIABLES}, cursor: $cursor) {
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
                        cursor: cursor,
                    } 
                })

                const data = response?.data
                console.log(`🏋️‍♂️ Complexity Use Variables Next Page: ${JSON.stringify(data?.complexity)}`)
                cursor = data?.next_items_page?.cursor
                const nextItems = data?.next_items_page?.items

                items.push(...nextItems)
            }

            const variables = items?.map((item) => {
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