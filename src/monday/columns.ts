import mondaySdk from "monday-sdk-js"
import { mondayGraphQLQueries } from "./queries"

export const getBoardColumns = async (boardId: string, types: string[]) => {
    try {
        const mondayClient = mondaySdk()
        
        const response = await mondayClient.api(mondayGraphQLQueries.listBoardColumns, { variables: { boardId: [boardId], types } })
        console.log(response)
        return response?.data?.boards[0]?.columns || []
    } catch (err) {
        console.error(err)
    }
}