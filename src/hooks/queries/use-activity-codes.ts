"use client"

import { CACHE_TIMES, QUERY_KEYS, LIMITS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getBoardSettings } from "@/lib/utils"
import { useMemo } from "react"

export const useActivityCodes = (options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    const { boardId } = useMemo(() => getBoardSettings(settings, "ACTIVITY_CODES"), [settings])
    
    return useQuery({
        queryKey: [QUERY_KEYS.ACTIVITY_CODES],
        queryFn: async () => {
            const response = await monday.api(`
                query getActivityCodes (
                    $activityCodesBoardId: [ID!]
                ) {
                    boards(ids: $activityCodesBoardId) {
                        items_page ( 
                            limit: ${LIMITS.ACTIVITY_CODES}
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
                        activityCodesBoardId: boardId,
                    } 
                }
            )

            const data = response?.data
            console.log(`🏋️‍♂️ Complexity Use Activity Codes: ${JSON.stringify(data?.complexity)}`)
            let cursor = data?.boards?.[0]?.items_page?.cursor
            const activityCodes = []

            activityCodes.push(...data?.boards?.[0]?.items_page?.items)

            while (cursor) {
                const response = await monday.api(`
                    query getNextActivityCodes (
                        $cursor: String!
                    ) {
                        complexity {
                            before
                            query
                        }
                        next_items_page(limit: ${LIMITS.ACTIVITY_CODES}, cursor: $cursor) {
                            cursor
                            items {
                                id
                                name
                            }
                        }
                    }`, { 
                        variables: { 
                            activityCodesBoardId: boardId,
                            cursor: cursor,
                        } 
                    })

                const data = response?.data
                console.log(`🏋️‍♂️ Complexity Use Activity Codes Next Page: ${JSON.stringify(data?.complexity)}`)
                cursor = data?.next_items_page?.cursor
                const items = data?.next_items_page?.items

                activityCodes.push(...items)
            }

            return activityCodes
        },
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}