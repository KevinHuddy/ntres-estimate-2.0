"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useQuotes = (projectId: string, options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()
    
    return useQuery({
        queryKey: [QUERY_KEYS.QUOTES, projectId],
        queryFn: async () => {
            const response = await monday.api(`
                query getQuotes (
                    $projectId: [ID!]!
                ) {
                    complexity {
                        before
                        query
                    }
                    items(ids: $projectId) {
                        subitems {
                            id
                            name
                            column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.PROJECTS_SUB || {}).flat().filter(Boolean))}) {
                                id
                                ... on TextValue { text }
                                ... on BoardRelationValue { linked_items { id, name } }
                            }
                        }
                    }
                }`, { 
                    variables: { 
                        projectId: [projectId],
                    } 
                }
            )

            console.log({response});

            const quotes = []

            const data = response?.data
            const items = data?.items?.[0]?.subitems

            const mappedItems = items?.map((item) => {
                const cols = item?.column_values
                const settingsCols = settings?.COLUMNS?.PROJECTS_SUB

                return {
                    id: item?.id,
                    name: item?.name,
                    total: getColValue(cols, settingsCols?.NUMBER)?.text || 0,
                    quote: getColValue(cols, settingsCols?.LINKED_QUOTE)?.linked_items?.map(i => i?.id) || [],
                }
            })

            quotes.push(...(mappedItems || []))

            return quotes
        },
        enabled: !!projectId,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}

function getColValue(cols, colId) {
    return cols?.find((col) => col?.id === colId)
}