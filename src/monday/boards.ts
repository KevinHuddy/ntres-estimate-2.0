import mondaySdk from "monday-sdk-js"
import { mondayGraphQLQueries } from "./queries"

export const getBoards = async () => {
    try {
        const mondayClient = mondaySdk()
        
        const response = await mondayClient.api(mondayGraphQLQueries.listBoards)
        const boards = response?.data?.boards.filter(board => !board.name?.includes('Sous-éléments') && !board.name?.includes('Sub-items'))
        return boards
    } catch (err) {
        console.error(err)
    }
}