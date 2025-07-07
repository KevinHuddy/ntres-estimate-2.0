"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useLineItems = (takeoffId: string | undefined, options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()
    
    return useQuery({
        queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId],
        queryFn: async () => {
            const response = await monday.api(`
                query getLineItems (
                    $lineItemsBoardId: [ID!]
                ) {
                    boards(ids: $lineItemsBoardId) {
                        items_page ( 
                            limit: 500 
                            query_params: {
                                rules: [
                                    {
                                        column_id: "${settings?.COLUMNS?.LINE_ITEMS?.LINKED_TAKEOFF}",
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
                                column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.LINE_ITEMS).flat())}) {
                                    id
                                    ... on TextValue { text }
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
                        lineItemsBoardId: settings?.BOARDS?.LINE_ITEMS,
                    } 
                }
            )

            const data = response?.data
            
            const lineItems = data?.boards?.[0]?.items_page?.items?.map((item) => {
                const cols = item?.column_values
                const settingsCols = settings?.COLUMNS?.LINE_ITEMS

                return {
                    id: item?.id,
                    name: item?.name,
                    values: getColValue(cols, settingsCols?.VALUES)?.linked_items?.map(i => i?.id) || [],
                    values_total: Number(getColValue(cols, settingsCols?.VALUES_TOTAL)?.display_value || 0),
                    category: getColValue(cols, settingsCols?.CATEGORY)?.text,
                    type: getColValue(cols, settingsCols?.TYPE)?.text || "",
                    unit_type: getColValue(cols, settingsCols?.UNIT_TYPE)?.text || "",
                    qty_takeoff: getColValue(cols, settingsCols?.QTY_TAKEOFF)?.number || 0,
                    qty_quote: getColValue(cols, settingsCols?.QTY_QUOTE)?.number || 0,
                    cost_takeoff: getColValue(cols, settingsCols?.COST_TAKEOFF)?.number || 0,
                    cost_quote: getColValue(cols, settingsCols?.COST_QUOTE)?.number || 0,
                    linked_activity_code: getColValue(cols, settingsCols?.LINKED_ACTIVITY_CODE)?.text || "",
                    linked_takeoff: getColValue(cols, settingsCols?.LINKED_TAKEOFF)?.text || "",
                    linked_quote: getColValue(cols, settingsCols?.LINKED_QUOTE)?.text || undefined,
                    linked_project: getColValue(cols, settingsCols?.LINKED_PROJECT)?.text || undefined,
                    linked_product: getColValue(cols, settingsCols?.LINKED_PRODUCT)?.text || undefined,
                    linked_template_line_item: getColValue(cols, settingsCols?.LINKED_TEMPLATE_LINE_ITEM)?.text || "",
                    linked_supplier: getColValue(cols, settingsCols?.LINKED_SUPPLIER)?.text || undefined,
                    linked_price_request: getColValue(cols, settingsCols?.LINKED_PRICE_REQUEST)?.text || "",
                    waste: getColValue(cols, settingsCols?.WASTE)?.number || 0,
                    divider: getColValue(cols, settingsCols?.DIVIDER)?.number || 0,
                    multiplier: getColValue(cols, settingsCols?.MULTIPLIER)?.number || 0,
                    mo_hours: getColValue(cols, settingsCols?.MO_HOURS)?.number || 0,
                    mo_qty: getColValue(cols, settingsCols?.MO_QTY)?.number || 0,
                    mo_days: getColValue(cols, settingsCols?.MO_DAYS)?.number || 0,
                }
            })
            

            return lineItems
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