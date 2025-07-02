"use client"

import { getBoards } from "@/monday/boards"
import { QUERY_KEYS } from "@/utils/constants"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useBoards = (): UseQueryResult<any> => {
    return useQuery({
        queryKey: [QUERY_KEYS.BOARDS],
        queryFn: () => getBoards(),
    })
}