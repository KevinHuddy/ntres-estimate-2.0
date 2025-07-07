export const columnValuesFragment = `
fragment ColumnValuesFragment on ColumnValue 
{
    id
    value
    text
    ... on ButtonValue {
        label
    }
    ... on MirrorValue {
        display_value
    }
    ... on WorldClockValue {
        timezone
    }
    ... on StatusValue {
        label
    }
    ... on VoteValue {
        vote_count
    }
    ... on TagsValue {
        tags {
            name
        }
    }
    ... on BoardRelationValue {
        linked_item_ids
        display_value
    }
    ... on DependencyValue {
        linked_item_ids
        display_value
    }
    ... on WeekValue {
        start_date
        end_date
    }
}`;

export const mondayGraphQLQueries = {
    getTakeoffData: `
    ${columnValuesFragment}
    query getTakeoffData($takeoffId: [ID!], $lineItemBoardId: ID!, $limit: Int, $columns: [ItemsPageByColumnValuesQuery!])
    {
        takeoff: items(ids: $takeoffId)
        {
            id
            name
            column_values {
                ...ColumnValuesFragment
            }
        }
        takeoff_line_items: items_page_by_column_values(
            limit: $limit,
            board_id: $lineItemBoardId,
            columns: $columns
        ) {
            cursor
            items {
                id
                name
                board { id }
                column_values {
                    ...ColumnValuesFragment
                }
            }
        }
    }`,
    listBoardItems: `
    ${columnValuesFragment}
    query listBoardItems($boardId: [ID!], $limit: Int, $columnIds: [String!])
    {
        boards(ids: $boardId)
        {
            columns(ids: $columnIds) 
            {
                id
                title
                type
                settings_str
                description
            }
            items_page(limit: $limit)
            {
                cursor
                items
                {
                    id
                    name
                    column_values(ids: $columnIds)
                    {
                        ...ColumnValuesFragment
                    }
                }
            }
        }
    }`,
    listBoardItemsNextPage: `
    ${columnValuesFragment}
    query listBoardItemsNextPage($limit: Int, $cursor: String!, $columnIds: [String!]) {
        next_items_page(
            limit: $limit,
            cursor: $cursor
        ) {
            cursor
            items {
                id
                name
                column_values(ids: $columnIds)
                {
                    ...ColumnValuesFragment
                }
            }
        }
    }`,
    listBoards: `
        query listBoards 
        {
            boards(limit: 1000)
            {
                id
                name
            }
        }`,
    listBoardColumns: `
        query listBoardColumns($boardId: [ID!], $types: [ColumnType!])
        {
            boards(ids: $boardId)
            {
                columns(types: $types) {
                    id
                    title
                    type
                    settings_str
                    description
                }
            }
        }`
}