"use client"

import { useMonday } from "@/components/monday-context-provider"
import { mondayGraphQLQueries } from "@/utils/monday-queries"

import { CACHE_TIMES, QUERY_KEYS } from "@/utils/constants"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useBoards = (options: any = {}): UseQueryResult<any> => {
    const { monday } = useMonday()

    return useQuery({
        queryKey: [QUERY_KEYS.BOARDS],
        queryFn: async () => {
            try {
                const response = await monday.api(mondayGraphQLQueries.listBoards)
                console.log(`🏋️‍♂️ Complexity Use Boards: ${JSON.stringify(response?.data?.complexity)}`)
                const boards = response?.data?.boards.filter(board => !board.name?.includes('Sous-éléments') && !board.name?.includes('Sub-items'))
                return boards
            } catch (error) {
                console.error(error)
                return null
            }
        },
        staleTime: CACHE_TIMES.NEVER_STALE,
        gcTime: CACHE_TIMES.NEVER_STALE,
        ...options
    })
}