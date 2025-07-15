"use client"

import { QUERY_KEYS } from "@/utils/constants";
import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMonday } from "@/components/monday-context-provider";
import { getBoardSettings } from "@/lib/utils";

const client = new MondayClient()

export const useCreatePriceRequest = () => {
    const { settings } = useMonday()
    const { cols, boardId} = getBoardSettings(settings, "PRICE_REQUEST")
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: any) => {
            return await client.items.create({
                itemName: body.name,
                boardId: boardId,
                createLabels: true,
                columnValues: {
                    [cols.LINKED_TAKEOFF]: body.takeoffId?.toString(),
                    [cols.LINKED_SUPPLIER]: body.supplierId?.toString(),
                    [cols.LINKED_PROJECT]: body.projectId?.toString(),
                }
            })
        },
        onError: (error) => {
            console.error('Error creating price request:', error)
        },
        onSettled: (data, error, {takeoffId}) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRICE_REQUEST, takeoffId] })
        }
    })
}