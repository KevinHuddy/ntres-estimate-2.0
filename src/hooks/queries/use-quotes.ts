"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getBoardSettings } from "@/lib/utils"

export const useQuotes = (projectId: string, options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()
    const { cols: settingsCols } = getBoardSettings(settings, "PROJECTS_SUB")
    
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

            function getColValue(cols: any, colId: string) {
                return cols?.find((col) => col?.id === colId)
            }

            const mappedItems = items?.map((item) => {
                const cols = item?.column_values

                return {
                    id: item?.id,
                    name: item?.name,
                    total: getColValue(cols, settingsCols?.NUMBER)?.text || 0,
                    quote: getColValue(cols, settingsCols?.LINKED_QUOTE)?.linked_items?.map(i => i?.id) || [],
                }
            }).filter(i => !i?.quote?.length)

            console.log({settingsCols, mappedItems});

            quotes.push(...(mappedItems || []))

            return quotes
        },
        enabled: !!projectId,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}

export const useQuoteData = (quoteId: string | undefined, options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    function getColValue(cols: any, colId: string) {
        return cols?.find((col) => col?.id === colId)
    }
    
    return useQuery({
        queryKey: [QUERY_KEYS.QUOTES, 'data', quoteId],
        queryFn: async () => {
            const response = await monday.api(`
                query getQuoteData (
                    $quoteId: [ID!]
                ) {
                    complexity {
                        before
                        query
                    }
                    items(ids: $quoteId) {
                        id
                        name
                        column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.QUOTES || {}).flat().filter(Boolean))}) {
                            id
                            ... on NumbersValue { 
                                number
                                column {
                                    title
                                }
                            }
                            ... on BoardRelationValue { linked_items { id, name } }
                            ... on MirrorValue { display_value }
                            ... on TextValue { text }
                        }
                    }
                }`, { 
                    variables: { 
                        quoteId: [quoteId],
                    } 
                }
            )

            const data = response?.data
            console.log(`🏋️‍♂️ Complexity Use Quote Data: ${JSON.stringify(data?.complexity)}`)
            const quote = data?.items?.[0]
            const quoteCols = quote?.column_values

            return {
                id: quote?.id,
                name: quote?.name,
                total: getColValue(quoteCols, settings?.COLUMNS?.QUOTES?.TOTAL)?.number || 0,
                linked_project: getColValue(quoteCols, settings?.COLUMNS?.QUOTES?.LINKED_PROJECT)?.linked_items?.[0]?.id,
                linked_takeoff: getColValue(quoteCols, settings?.COLUMNS?.QUOTES?.LINKED_TAKEOFF)?.linked_items?.[0]?.id,
                linked_contract: getColValue(quoteCols, settings?.COLUMNS?.QUOTES?.LINKED_CONTRACT)?.linked_items?.[0]?.id,
                linked_project_subitem: getColValue(quoteCols, settings?.COLUMNS?.QUOTES?.LINKED_PROJECT_SUBITEM)?.linked_items?.[0]?.id,
            }
        },
        enabled: !!quoteId && !!settings,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}