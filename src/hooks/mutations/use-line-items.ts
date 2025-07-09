"use client"

import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMonday } from "@/components/monday-context-provider";
import { QUERY_KEYS } from "@/utils/constants"
import { getBoardSettings } from "@/lib/utils";

const client = new MondayClient()

export const useCreateLineItemsMutation = () => {
    const { settings } = useMonday();
    const { cols, boardId} = getBoardSettings(settings, "LINE_ITEMS")
    
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            columns,
            takeoffId
        }: {
            name: string
            columns: Record<string, string>
            takeoffId: string
        }) => {
            console.log({name, columns, takeoffId})
            try {
                const response = await client.items.create({
                    itemName: name,
                    boardId: boardId,
                    createLabels: true,
                    columnValues: {
                        ...columns, 
                        [cols.LINKED_TAKEOFF]: takeoffId.toString(),
                    }
                })
                return response
            } catch (error) {
                console.error(error)    
                toast.error("Failed to create line items")
                return null
            }
        },
        onSettled: (_, __, { takeoffId }) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId]
            })
        }
    })
}

export const useUpdateLineItemsMutation = () => {
    const { settings } = useMonday();
    const { cols, boardId} = getBoardSettings(settings, "LINE_ITEMS")
    
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            columns,
            takeoffId
        }: {
            id: string
            columns: Record<string, string>
            takeoffId: string
        }) => {
            console.log({id, columns, takeoffId})
            try {
                const response = await client.items.update({
                    itemId: id,
                    boardId: boardId,
                    createLabels: true,
                    columnValues: {
                        ...columns,
                        [cols.LINKED_TAKEOFF]: takeoffId.toString(),
                    }
                })
                return response
            } catch (error) {
                console.error(error)
                toast.error("Failed to update line items")
                return null
            }
        },
        onSettled: (_, __, { takeoffId }) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId]
            })
        }
    })
}