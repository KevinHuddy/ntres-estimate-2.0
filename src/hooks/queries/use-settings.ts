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
        $variablesBoardId: [ID!]
        $adminFeesBoardId: [ID!]
        $productsBoardId: [ID!]
        $priceRequestBoardId: [ID!]
        $projectsBoardId: [ID!]
    ) {
        complexity {
            before
            query
        }
        takeoff: boards(ids: $takeoffBoardId) { ...ColumnsFragment }
        lineItems: boards(ids: $lineItemsBoardId) { ...ColumnsFragment }
        templateLineItems: boards(ids: $templateLineItemsBoardId) { ...ColumnsFragment }
        variables: boards(ids: $variablesBoardId) { ...ColumnsFragment }
        adminFees: boards(ids: $adminFeesBoardId) { ...ColumnsFragment }
        products: boards(ids: $productsBoardId) { ...ColumnsFragment }
        priceRequest: boards(ids: $priceRequestBoardId) { ...ColumnsFragment }
        projects: boards(ids: $projectsBoardId) { ...ColumnsFragment }
    }`

const subQuery = `
    ${columnFragment}
    query getSubColumnSettings (
        $priceRequestSubBoardId: [ID!]
    ) {
        priceRequest: boards(ids: $priceRequestSubBoardId) { ...ColumnsFragment }
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
    lineItemsCols,
    variablesCols,
    adminFeesCols,
    productsCols,
    priceRequestCols,
    priceRequestSubCols,
    projectsSubCols,
}: {
    takeoffCols: any,
    templateLineItemsCols: any,
    lineItemsCols: any,
    variablesCols: any,
    adminFeesCols: any,
    productsCols: any,
    priceRequestCols: any,
    priceRequestSubCols: any,
    projectsSubCols: any,
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
        PRODUCTS: {
            CATEGORY: getColId(productsCols, "{{{category}}}"),
            TYPE: getColId(productsCols, "{{{type}}}"),
            LINKED_SUPPLIER: getColId(productsCols, "{{{linked_supplier}}}"),
            UNIT_TYPE: getColId(productsCols, "{{{unit}}}"),
            COST: getColId(productsCols, "{{{ppv1}}}"),
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
        },
        VARIABLES: {
            VALUE: getColId(variablesCols, "{{{value}}}"),
            UNIT_TYPE: getColId(variablesCols, "{{{unit_type}}}"),
            LINKED_TAKEOFF: getColId(variablesCols, "{{{linked_takeoff}}}"),
        },
        ADMIN_FEES: {
            LINKED_TAKEOFF: getColId(adminFeesCols, "{{{linked_takeoff}}}"),
            ADMIN: getColId(adminFeesCols, "{{{admin}}}"),
            MARGIN: getColId(adminFeesCols, "{{{margin}}}"),
            UNFORESEEN: getColId(adminFeesCols, "{{{unforeseen}}}"),
            OTHER: getColId(adminFeesCols, "{{{other}}}"),
        },
        PRICE_REQUEST: {
            LINKED_TAKEOFF: getColId(priceRequestCols, "{{{linked_takeoff}}}"),
            LINKED_SUPPLIER: getColId(priceRequestCols, "{{{linked_supplier}}}"),
            LINKED_PROJECT: getColId(priceRequestCols, "{{{linked_project}}}"),
        },
        PRICE_REQUEST_SUB: {
            QTY: getColId(priceRequestSubCols, "{{{qty}}}"),
            UNIT_TYPE: getColId(priceRequestSubCols, "{{{unit}}}"),
            LINKED_LINE_ITEM: getColId(priceRequestSubCols, "{{{line_id}}}"),
            LINKED_TAKEOFF: getColId(priceRequestSubCols, "{{{takeoff_id}}}"),
            LINKED_PRODUCT: getColId(priceRequestSubCols, "{{{product}}}"),
        },
        PROJECTS_SUB: {
            NUMBER: getColId(projectsSubCols, "{{{number}}}"),
            LINKED_QUOTE: getColId(projectsSubCols, "{{{linked_quote}}}"),
        }
    }
}



export const useGetSettings = (options: any = {}): UseQueryResult<any> => {
    
    return useQuery({
        queryKey: [QUERY_KEYS.SETTINGS],
        queryFn: async () : Promise<any> => {
            try {
                const settings = await monday.storage.getItem('config')
                const mainSettings = JSON.parse(settings?.data?.value || '{}')
                const columnSettings = await monday.api(
                    query, { variables: {
                        lineItemsBoardId: mainSettings?.BOARD_LINE_ITEMS,
                        templateLineItemsBoardId: mainSettings?.BOARD_TEMPLATE_LINE_ITEMS,
                        takeoffBoardId: mainSettings?.BOARD_TAKEOFF,
                        variablesBoardId: mainSettings?.BOARD_VARIABLES,
                        adminFeesBoardId: mainSettings?.BOARD_ADMIN_FEES,
                        productsBoardId: mainSettings?.BOARD_PRODUCTS,
                        priceRequestBoardId: mainSettings?.BOARD_PRICE_REQUEST,
                        projectsBoardId: mainSettings?.BOARD_PROJECTS,
                    }
                })

                function findSubBoardId(columns) {
                    const subtasks = columns?.find((column) => column.type === "subtasks")
                    const settings = JSON.parse(subtasks?.settings_str);
                    return settings?.boardIds?.[0] || null;
                }

                const SUB_BOARDS = {
                    PRICE_REQUEST: findSubBoardId(columnSettings?.data?.priceRequest?.[0]?.columns),
                    PROJECTS: findSubBoardId(columnSettings?.data?.projects?.[0]?.columns),
                }

                const subColumnSettings = await monday.api(
                    subQuery, { variables: {
                        priceRequestSubBoardId: SUB_BOARDS?.PRICE_REQUEST,
                        projectsSubBoardId: SUB_BOARDS?.PROJECTS,
                    }
                })


                console.log(`🏋️‍♂️ Complexity Use Settings: ${JSON.stringify(columnSettings?.data?.complexity)}`)

                const columns = COLUMNS({
                    takeoffCols: columnSettings?.data?.takeoff?.[0]?.columns,
                    templateLineItemsCols: columnSettings?.data?.templateLineItems?.[0]?.columns,
                    lineItemsCols: columnSettings?.data?.lineItems?.[0]?.columns,
                    variablesCols: columnSettings?.data?.variables?.[0]?.columns,
                    adminFeesCols: columnSettings?.data?.adminFees?.[0]?.columns,
                    productsCols: columnSettings?.data?.products?.[0]?.columns,
                    priceRequestCols: columnSettings?.data?.priceRequest?.[0]?.columns,
                    priceRequestSubCols: subColumnSettings?.data?.priceRequest?.[0]?.columns,
                    projectsSubCols: subColumnSettings?.data?.projects?.[0]?.columns,
                })

                return {
                    BOARDS: {
                        TAKEOFF: mainSettings?.BOARD_TAKEOFF,
                        LINE_ITEMS: mainSettings?.BOARD_LINE_ITEMS,
                        TEMPLATE_LINE_ITEMS: mainSettings?.BOARD_TEMPLATE_LINE_ITEMS,
                        ADMIN_FEES: mainSettings?.BOARD_ADMIN_FEES,
                        VARIABLES: mainSettings?.BOARD_VARIABLES,
                        QUOTES: mainSettings?.BOARD_QUOTES,
                        CONTRACTS: mainSettings?.BOARD_CONTRACTS,
                        SUPPLIERS: mainSettings?.BOARD_SUPPLIERS,
                        PRODUCTS: mainSettings?.BOARD_PRODUCTS,
                        ACTIVITY_CODES: mainSettings?.BOARD_ACTIVITY_CODES,
                        TOOLS: mainSettings?.BOARD_TOOLS,
                        PRICE_REQUEST: mainSettings?.BOARD_PRICE_REQUEST,
                        PRICE_REQUEST_SUB: SUB_BOARDS?.PRICE_REQUEST,
                        PROJECTS: mainSettings?.BOARD_PROJECTS,
                        PROJECTS_SUB: SUB_BOARDS?.PROJECTS,
                    },
                    CATEGORIES: {
                        TOOLS: mainSettings?.CATEGORY_TOOLS,
                        MO: mainSettings?.CATEGORY_MO,
                    },
                    COLUMNS: {
                        ...columns
                    },
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