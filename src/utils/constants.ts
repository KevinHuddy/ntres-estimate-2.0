export const QUERY_KEYS = {
    BOARDS: 'boards',
    COLUMNS: 'columns',
    TAKEOFF: 'takeoff',
    TEMPLATE_LINE_ITEMS: 'template-line-items',
    LINE_ITEMS: 'line-items',
}

export const CACHE_TIMES = {
    NEVER_STALE: Infinity,
    STATIC_DATA: 1000 * 60 * 60 * 24,
    DYNAMIC_DATA: 1000 * 60 * 5,
    CRITICAL_DATA: 0,
}