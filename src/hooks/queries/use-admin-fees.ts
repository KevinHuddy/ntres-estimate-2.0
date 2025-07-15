"use client"

import { CACHE_TIMES, QUERY_KEYS, LIMITS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useAdminFees = (takeoffId: string | undefined, options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()
    
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_FEES, takeoffId],
        queryFn: async () => {
            const response = await monday.api(`
                query getAdminFees (
                    $adminFeesBoardId: [ID!]
                ) {
                    complexity {
                        before
                        query
                    }
                    boards(ids: $adminFeesBoardId) {
                        items_page ( 
                            limit: ${LIMITS.ADMIN_FEES},
                            query_params: {
                                rules: [
                                    {
                                        column_id: "${settings?.COLUMNS?.ADMIN_FEES?.LINKED_TAKEOFF}",
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
                                    column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.ADMIN_FEES).flat())}) {
                                    id
                                    ... on TextValue { text }
                                    ... on NumbersValue { number }
                                }
                            }
                        }
                    }
                }`, { 
                    variables: { 
                        adminFeesBoardId: settings?.BOARDS?.ADMIN_FEES,
                    } 
                }
            )

            const data = response?.data
            console.log(`🏋️‍♂️ Complexity Use Admin Fees: ${JSON.stringify(data?.complexity)}`)
            let cursor = data?.boards?.[0]?.items_page?.cursor
            const items = []

            items.push(...data?.boards?.[0]?.items_page?.items)

            while (cursor) {
                const response = await monday.api(`
                    query getNextAdminFees (
                        $cursor: String!
                    ) {
                        complexity { before query }
                        next_items_page(limit: ${LIMITS.ADMIN_FEES}, cursor: $cursor) {
                            cursor
                            items {
                                id
                            }
                        }
                    }
                `, { variables: { cursor } })

                const data = response?.data
                cursor = data?.next_items_page?.cursor
                console.log(`🏋️‍♂️ Complexity Use Admin Fees Next Page: ${JSON.stringify(data?.complexity)}`)
                items.push(...data?.next_items_page?.items)
            }

            const adminFees = items?.map((item) => {
                const cols = item?.column_values
                const settingsCols = settings?.COLUMNS?.ADMIN_FEES

                return {
                    id: item?.id,
                    name: item?.name,
                    admin: getColValue(cols, settingsCols?.ADMIN)?.number || 0,
                    margin: getColValue(cols, settingsCols?.MARGIN)?.number || 0,
                    unforeseen: getColValue(cols, settingsCols?.UNFORESEEN)?.number || 0,
                    other: getColValue(cols, settingsCols?.OTHER)?.number || 0,
                }
            })
            
            return adminFees
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
