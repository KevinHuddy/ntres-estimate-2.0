"use client"

import { getBoardColumns } from "@/monday/columns"
import { QUERY_KEYS } from "@/utils/constants"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useColumns = (boardId: string, types: string[]): UseQueryResult<any> => {
    return useQuery({
        queryKey: [QUERY_KEYS.COLUMNS, boardId, types],
        queryFn: () => getBoardColumns(boardId, types),
    })
}