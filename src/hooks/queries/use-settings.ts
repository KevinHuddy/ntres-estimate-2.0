"use client"

import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"

import mondaySdk from "monday-sdk-js"

const monday = mondaySdk()

const columnFragment = `
fragment ColumnsFragment on Board {
    columns {
        id
        title
        type
        settings_str
        description
    }
}`

const query = `
    ${columnFragment}
    query getColumnSettings (
        $lineItemsBoardId: [ID!]
        $takeoffBoardId: [ID!]
        $templateLineItemsBoardId: [ID!]
    ) {
        takeoff: boards(ids: $takeoffBoardId) { ...ColumnsFragment }
        lineItems: boards(ids: $lineItemsBoardId) { ...ColumnsFragment }
        templateLineItems: boards(ids: $templateLineItemsBoardId) { ...ColumnsFragment }
    }`



function getColId(columns: any, tag: string) {
    return columns?.find((column) => column?.description?.includes(tag))?.id || null
}
function getColIds(columns: any, tag: string) {
    return columns?.filter((column) => column?.description?.includes(tag)).map((col) => col.id) || []
}

const COLUMNS = ({ 
    takeoffCols,
    templateLineItemsCols,
    lineItemsCols
}: {
    takeoffCols: any,
    templateLineItemsCols: any,
    lineItemsCols: any,
    // adminFeesCols: any,
    // variablesCols: any
}) => {
    return {
        TAKEOFF: {
            TOTAL: getColId(takeoffCols, "{{{ntr.takeoff.total}}}"),
            LINKED_PROJECT: getColId(takeoffCols, "{{{ntr.takeoff.linked_project}}}"),
            LINKED_PROJECT_NUMBER: getColId(takeoffCols, "{{{linked_project_number}}}"),
            LINKED_PRICE_REQUEST: getColId(takeoffCols, "{{{ntr.takeoff.linked_price_request}}}"),
            LINKED_QUOTE: getColId(takeoffCols, "{{{ntr.takeoff.linked_quote}}}"),
            FEE: getColIds(takeoffCols, "{{{ntr.takeoff.fee}}}"),
        },
        TEMPLATE_LINE_ITEMS: {
            CATEGORY: getColId(templateLineItemsCols, "{{{ntr.estimate.category}}}"),
            TYPE: getColId(templateLineItemsCols, "{{{ntr.estimate.type}}}"),
            LINKED_ACTIVITY_CODE: getColId(templateLineItemsCols, "{{{ntr.estimate.linked_activity_code}}}"),
            UNIT_TYPE: getColId(templateLineItemsCols, "{{{ntr.estimate.unit_type}}}"),
            PRICE: getColId(templateLineItemsCols, "{{{ntr.estimate.price}}}"),
            WASTE: getColId(templateLineItemsCols, "{{{ntr.estimate.takeoff.waste}}}"),
            DIVIDER: getColId(templateLineItemsCols, "{{{ntr.estimate.takeoff.divider}}}"),
            MULTIPLIER: getColId(templateLineItemsCols, "{{{ntr.estimate.takeoff.multiplier}}}"),
            LINKED_SUPPLIER: getColId(templateLineItemsCols, "{{{ntr.estimate.linked_supplier}}}"),
            LINKED_PRODUCT: getColId(templateLineItemsCols, "{{{ntr.estimate.linked_product}}}"),
            LINKED_PRODUCT_COST: getColId(templateLineItemsCols, "{{{ntr.estimate.linked_product_cost}}}")
        },
        LINE_ITEMS: {
            VALUES: getColId(lineItemsCols, "{{{linked_values}}}"),
            VALUES_TOTAL: getColId(lineItemsCols, "{{{linked_values_total}}}"),
            CATEGORY: getColId(lineItemsCols, "{{{category}}}"),
            TYPE: getColId(lineItemsCols, "{{{type}}}"),
            UNIT_TYPE: getColId(lineItemsCols, "{{{unit_type}}}"),
            QTY_TAKEOFF: getColId(lineItemsCols, "{{{qty_takeoff}}}"),
            QTY_QUOTE: getColId(lineItemsCols, "{{{qty_quote}}}"),
            // QTY_CONTRACT: getColId(lineItemsCols, "{{{qty_contract}}}"),
            COST_TAKEOFF: getColId(lineItemsCols, "{{{cost_takeoff}}}"),
            COST_QUOTE: getColId(lineItemsCols, "{{{cost_quote}}}"),
            // COST_CONTRACT: getColId(lineItemsCols, "{{{cost_contract}}}"),
            LINKED_ACTIVITY_CODE: getColId(lineItemsCols, "{{{activity_code}}}"),
            LINKED_TAKEOFF: getColId(lineItemsCols, "{{{linked_takeoff}}}"),
            LINKED_QUOTE: getColId(lineItemsCols, "{{{linked_quote}}}"),
            LINKED_PROJECT: getColId(lineItemsCols, "{{{linked_project}}}"),
            LINKED_PRODUCT: getColId(lineItemsCols, "{{{linked_product}}}"),
            LINKED_TEMPLATE_LINE_ITEM: getColId(lineItemsCols, "{{{linked_template_line_item}}}"),
            LINKED_SUPPLIER: getColId(lineItemsCols, "{{{linked_supplier}}}"),
            LINKED_PRICE_REQUEST: getColId(lineItemsCols, "{{{linked_price_request}}}"),
            WASTE: getColId(lineItemsCols, "{{{waste}}}"),
            DIVIDER: getColId(lineItemsCols, "{{{divider}}}"),
            MULTIPLIER: getColId(lineItemsCols, "{{{multiplier}}}"),
            MO_HOURS: getColId(lineItemsCols, "{{{mo_hours}}}"),
            MO_QTY: getColId(lineItemsCols, "{{{mo_qty}}}"),
            MO_DAYS: getColId(lineItemsCols, "{{{mo_days}}}"),
        }
        // ADMIN_FEES: {},
        // VARIABLES: {}
    }
}



export const useGetSettings = (options: any = {}): UseQueryResult<any> => {
    
    return useQuery({
        queryKey: [QUERY_KEYS.SETTINGS],
        queryFn: async () : Promise<any> => {
            try {
                const settings = await monday.storage.getItem('config')
                const mainSettings = JSON.parse(settings?.data?.value)
                const columnSettings = await monday.api(
                    query, { variables: {
                        lineItemsBoardId: mainSettings?.BOARDS?.LINE_ITEMS,
                        templateLineItemsBoardId: mainSettings?.BOARDS?.TEMPLATE_LINE_ITEMS,
                        takeoffBoardId: mainSettings?.BOARDS?.TAKEOFF
                    }
                })

                const columns = COLUMNS({
                    takeoffCols: columnSettings?.data?.takeoff?.[0]?.columns,
                    templateLineItemsCols: columnSettings?.data?.templateLineItems?.[0]?.columns,
                    lineItemsCols: columnSettings?.data?.lineItems?.[0]?.columns
                })

                return {
                    ...mainSettings,
                    COLUMNS: {
                        ...columns
                    }
                    // lineItems: columnSettings?.data?.lineItems?.[0],
                    // takeoff: columnSettings?.data?.takeoff?.[0]
                }
            } catch (error) {
                console.error('Error fetching settings', error)
                return null
            }
        },
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options
    })
}