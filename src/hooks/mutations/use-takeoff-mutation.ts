"use client"

import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMonday } from "@/components/monday-context-provider";
import { QUERY_KEYS } from "@/utils/constants"

export const useUpdateTakeoffMutation = () => {
    const { settings } = useMonday();
    const client = new MondayClient()

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            columns
        }: {
            id: string
            columns: Record<string, string>
        }) => {
            try {
                const response = await client.items.update({
                    itemId: id,
                    boardId: settings.BOARDS.TAKEOFF,
                    columnValues: columns
                })
                return response
            } catch (error) {
                console.error(error)
                toast.error("Failed to update takeoff")
                return null
            }
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.TAKEOFF, id]
            })
        }
    })
}