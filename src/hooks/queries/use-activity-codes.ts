"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getBoardSettings } from "@/lib/utils"
import { useMemo } from "react"

export const useSuppliers = (options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    const { boardId } = useMemo(() => getBoardSettings(settings, "ACTIVITY_CODES"), [settings])
    
    return useQuery({
        queryKey: [QUERY_KEYS.SUPPLIERS],
        queryFn: async () => {
            const response = await monday.api(`
                query getSuppliers (
                    $suppliersBoardId: [ID!]
                ) {
                    boards(ids: $suppliersBoardId) {
                        items_page ( 
                            limit: 500
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
            const items = data?.boards?.[0]?.items_page?.items
            
            let cursor = data?.boards?.[0]?.items_page?.cursor

            suppliers.push(...items)

            while (cursor) {
                const response = await monday.api(`
                    query getNextSuppliers (
                        $cursor: String
                    ) {
                        next_items_page(limit: 500, cursor: $cursor) {
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
                        cursor: cursor,
                    } 
                })

                const data = response?.data
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