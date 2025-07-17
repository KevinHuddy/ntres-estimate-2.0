export const QUERY_KEYS = {
    SETTINGS: 'settings',
    COLUMNS_SETTINGS: 'columns-settings',
    BOARDS: 'boards',
    COLUMNS: 'columns',
    TAKEOFF: 'takeoff',
    TEMPLATE_LINE_ITEMS: 'template-line-items',
    LINE_ITEMS: 'line-items',
    QUOTE_LINE_ITEMS: 'quote-line-items',
    VARIABLES: 'variables',
    ADMIN_FEES: 'admin-fees',
    SUPPLIERS: 'suppliers',
    ACTIVITY_CODES: 'activity-codes',
    PRODUCTS: 'products',
    PRICE_REQUEST: 'price-request',
    QUOTES: 'quotes',
}

export const CACHE_TIMES = {
    NEVER_STALE: Infinity,
    STATIC_DATA: 1000 * 60 * 60 * 24,
    DYNAMIC_DATA: 1000 * 60 * 5,
    CRITICAL_DATA: 0,
}

export const LIMITS = {
    TEMPLATE_LINE_ITEMS: 100,
    LINE_ITEMS: 25,
    PRODUCTS: 100,
    ACTIVITY_CODES: 25,
    ADMIN_FEES: 5,
    SUPPLIERS: 50,
    VARIABLES: 10,
}