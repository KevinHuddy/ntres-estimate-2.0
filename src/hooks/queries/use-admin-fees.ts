"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
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
                    boards(ids: $adminFeesBoardId) {
                        items_page ( 
                            limit: 500 
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
            
            const adminFees = data?.boards?.[0]?.items_page?.items?.map((item) => {
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
