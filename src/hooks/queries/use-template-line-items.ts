"use client"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useMonday } from "@/components/monday-context-provider"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useTemplateLineItems = (options: any = {}): UseQueryResult<any> => {
    const { settings, monday } = useMonday()

    return useQuery({
        queryKey: [QUERY_KEYS.TEMPLATE_LINE_ITEMS],
        queryFn: async () => {
            const response = await monday.api(`
                query getTemplateLineItems (
                    $templateLineItemsBoardId: [ID!]
                ) {
                    boards(ids: $templateLineItemsBoardId) {
                        items_page ( limit: 500 ) {
                            cursor
                            items {
                                id
                                name
                                column_values (ids: ${JSON.stringify(Object.values(settings?.COLUMNS?.TEMPLATE_LINE_ITEMS).flat())}) {
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
                        templateLineItemsBoardId: settings?.BOARDS?.TEMPLATE_LINE_ITEMS,
                    } 
                }
            )

            const data = response?.data
            
            const templateLineItems = data?.boards?.[0]?.items_page?.items?.map((item) => {
                const cols = item?.column_values
                const settingsCols = settings?.COLUMNS?.TEMPLATE_LINE_ITEMS

                return {
                    id: item?.id,
                    name: item?.name,
                    category: getColValue(cols, settingsCols?.CATEGORY)?.text,
                    type: getColValue(cols, settingsCols?.TYPE)?.text || undefined,
                    linked_activity_code: getColValue(cols, settingsCols?.LINKED_ACTIVITY_CODE)?.linked_items?.map(i => i?.id) || undefined,
                    unit_type: getColValue(cols, settingsCols?.UNIT_TYPE)?.text || undefined,
                    price: getColValue(cols, settingsCols?.PRICE)?.number || undefined,
                    waste: getColValue(cols, settingsCols?.WASTE)?.number || undefined,
                    divider: getColValue(cols, settingsCols?.DIVIDER)?.number || undefined,
                    multiplier: getColValue(cols, settingsCols?.MULTIPLIER)?.number || undefined,
                    linked_supplier: getColValue(cols, settingsCols?.LINKED_SUPPLIER)?.linked_items?.map(i => i?.id) || undefined,
                    linked_product: getColValue(cols, settingsCols?.LINKED_PRODUCT)?.linked_items?.map(i => i?.id) || undefined,
                    linked_product_cost: Number(getColValue(cols, settingsCols?.LINKED_PRODUCT_COST)?.display_value || 0)

                }
            })
            

            return templateLineItems
        },
        enabled: !!settings?.BOARDS?.TEMPLATE_LINE_ITEMS,
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options,
    })
}

function getColValue(cols, colId) {
    return cols?.find((col) => col?.id === colId)
}