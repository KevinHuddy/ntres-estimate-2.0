"use client"

import { CACHE_TIMES, QUERY_KEYS, LIMITS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getBoardSettings } from "@/lib/utils"
import { useMemo } from "react"

export const useProducts = (options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    const { boardId } = useMemo(() => getBoardSettings(settings, "PRODUCTS"), [settings])
    
    return useQuery({
        queryKey: [QUERY_KEYS.PRODUCTS],
        queryFn: async () => {
            const response = await monday.api(`
                query getProducts (
                    $productsBoardId: [ID!]
                ) {
                    complexity {
                        before
                        query
                    }
                    boards(ids: $productsBoardId) {
                        items_page ( 
                            limit: ${LIMITS.PRODUCTS}
                        ) {
                            cursor
                            items {
                                id
                                name
                                column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.PRODUCTS).flat())}) {
                                    id
                                    ... on StatusValue { text }
                                    ... on DropdownValue { text }
                                    ... on BoardRelationValue { linked_items { id, name } }
                                    ... on MirrorValue { display_value }
                                    ... on NumbersValue { number }
                                }
                            }
                        }
                    }
                }`, { 
                    variables: { 
                        productsBoardId: boardId,
                    } 
                }
            )

            const products = []

            const data = response?.data
            const items = data?.boards?.[0]?.items_page?.items
            
            let cursor = data?.boards?.[0]?.items_page?.cursor

            // Map the first batch of products
            const mappedItems = items?.map((item) => {
                const cols = item?.column_values
                const settingsCols = settings?.COLUMNS?.PRODUCTS

                return {
                    id: item?.id,
                    name: item?.name,
                    category: getColValue(cols, settingsCols?.CATEGORY)?.text,
                    type: getColValue(cols, settingsCols?.TYPE)?.text,
                    unit_type: getColValue(cols, settingsCols?.UNIT_TYPE)?.text,
                    cost: getColValue(cols, settingsCols?.COST)?.number || 0,
                    linked_supplier: getColValue(cols, settingsCols?.LINKED_SUPPLIER)?.linked_items?.map(i => i?.id) || [],
                }
            })

            products.push(...(mappedItems || []))

            // Handle pagination for more products
            while (cursor) {
                const response = await monday.api(`
                    query getNextProducts (
                        $cursor: String!
                    ) {
                        complexity {
                            before
                            query
                        }
                        next_items_page(limit: ${LIMITS.PRODUCTS}, cursor: $cursor) {
                            cursor
                            items {
                                id
                                name
                                column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.PRODUCTS).flat())}) {
                                    id
                                    ... on StatusValue { text }
                                    ... on DropdownValue { text }
                                    ... on BoardRelationValue { linked_items { id, name } }
                                    ... on MirrorValue { display_value }
                                    ... on NumbersValue { number }
                                }
                            }
                        }
                    }`, { 
                        variables: { 
                            cursor: cursor,
                        } 
                    })

                const data = response?.data
                cursor = data?.next_items_page?.cursor
                const items = data?.next_items_page?.items

                // Map the next batch of products
                const mappedItems = items?.map((item) => {
                    const cols = item?.column_values
                    const settingsCols = settings?.COLUMNS?.PRODUCTS

                    return {
                        id: item?.id,
                        name: item?.name,
                        category: getColValue(cols, settingsCols?.CATEGORY)?.text,
                        type: getColValue(cols, settingsCols?.TYPE)?.text,
                        unit_type: getColValue(cols, settingsCols?.UNIT_TYPE)?.text,
                        cost: getColValue(cols, settingsCols?.COST)?.number || 0,
                        linked_supplier: getColValue(cols, settingsCols?.LINKED_SUPPLIER)?.linked_items?.map(i => i?.id) || [],
                    }
                })

                products.push(...(mappedItems || []))
            }

            return products
        },
        enabled: !!boardId,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}

function getColValue(cols, colId) {
    return cols?.find((col) => col?.id === colId)
}