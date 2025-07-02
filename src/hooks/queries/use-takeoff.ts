"use client"

import { getTakeoffData } from "@/monday"
import { QUERY_KEYS } from "@/utils/constants"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

export const useTakeoffData = (itemId: string, boardId: string): UseQueryResult<any> => {
    return useQuery({
        queryKey: [QUERY_KEYS.TAKEOFF, itemId],
        queryFn: () => getTakeoffData(itemId, boardId),
    })
}