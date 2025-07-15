"use client"

import { CACHE_TIMES, QUERY_KEYS, LIMITS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getBoardSettings } from "@/lib/utils"
import { useMemo } from "react"

export const useSuppliers = (options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    const { boardId } = useMemo(() => getBoardSettings(settings, "SUPPLIERS"), [settings])
    
    return useQuery({
        queryKey: [QUERY_KEYS.SUPPLIERS],
        queryFn: async () => {
            const response = await monday.api(`
                query getSuppliers (
                    $suppliersBoardId: [ID!]
                ) {
                    complexity {
                        before
                        query
                    }
                    boards(ids: $suppliersBoardId) {
                        items_page ( 
                            limit: ${LIMITS.SUPPLIERS}
                        ) {
                            cursor
                            items {
                                id
                                name
                            }
                        }
                    }
                }`, { 
                    variables: { 
                        suppliersBoardId: boardId,
                    } 
                }
            )

            const suppliers = []

            const data = response?.data
            console.log(`🏋️‍♂️ Complexity Use Suppliers: ${JSON.stringify(data?.complexity)}`)
            const items = data?.boards?.[0]?.items_page?.items
            
            let cursor = data?.boards?.[0]?.items_page?.cursor

            suppliers.push(...items)

            while (cursor) {
                const response = await monday.api(`
                    query getNextSuppliers (
                        $cursor: String!
                    ) {
                        complexity {
                            before
                            query
                        }
                        next_items_page(limit: ${LIMITS.SUPPLIERS}, cursor: $cursor) {
                            cursor
                            items {
                                id
                                name
                            }
                        }
                        }`, { 
                        variables: { 
                            suppliersBoardId: boardId,
                            cursor: cursor,
                        } 
                    })

                const data = response?.data
                console.log(`🏋️‍♂️ Complexity Use Suppliers Next Page: ${JSON.stringify(data?.complexity)}`)
                cursor = data?.next_items_page?.cursor
                const items = data?.next_items_page?.items

                suppliers.push(...items)
            }

            return suppliers
        },
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}