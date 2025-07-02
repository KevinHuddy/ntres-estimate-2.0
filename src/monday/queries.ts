export const mondayGraphQLQueries = {
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