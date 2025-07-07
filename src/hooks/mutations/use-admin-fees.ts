"use client"

import { QUERY_KEYS } from "@/utils/constants";
import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMonday } from "@/components/monday-context-provider";
import { getBoardSettings } from "@/lib/utils";

const client = new MondayClient()

export const useUpdateAdminFees = () => {
    const { settings } = useMonday()
    const { cols, boardId} = getBoardSettings(settings, "ADMIN_FEES")
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            takeoffId,
            adminFeeId,
            columns,
        }: {
            takeoffId: string,
            adminFeeId: string,
            columns: any
        }) => {
            return await client.items.update({
                itemId: adminFeeId,
                boardId: boardId,
                createLabels: true,
                columnValues: {
                    [cols.MARGIN]: columns.margin || 0,
                    [cols.ADMIN]: columns.admin || 0,
                    [cols.UNFORESEEN]: columns.unforeseen || 0,
                    [cols.OTHER]: columns.other || 0,
                }
            })
            console.log(takeoffId)
        },
        onError: (error) => {   
            console.error('Error updating admin:', error)
        },
        onSettled: (data, error, {takeoffId}) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FEES, takeoffId] })
        }
    })
}

export const useCreateAdminFees = () => {
    const { settings } = useMonday()
    const { cols, boardId} = getBoardSettings(settings, "ADMIN_FEES")
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: any) => {
            return await client.items.create({
                itemName: body.name,
                boardId: boardId,
                createLabels: true,
                columnValues: {
                    [cols.LINKED_TAKEOFF]: body.takeoffId?.toString(),
                    [cols.MARGIN]: body.margin || 0,
                    [cols.ADMIN]: body.admin || 0,
                    [cols.UNFORESEEN]: body.unforeseen || 0,
                    [cols.OTHER]: body.other || 0,
                }
            })
        },
        onError: (error) => {
            console.error('Error creating admin:', error)
        },
        onSettled: (data, error, {takeoffId}) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FEES, takeoffId] })
        }
    })
}

export const useDeleteAdminFees = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            adminFeeId,
            takeoffId
        }: {
            adminFeeId: string,
            takeoffId: string
        }) => {
            try {
                const response = await client.items.delete({
                    itemId: adminFeeId
                })
                return response
            } catch (error) {
                console.error(error)
                toast.error(`Failed to delete variable from takeoff ${takeoffId}`)
                return null
            }
        },
        onMutate: async ({ takeoffId, adminFeeId }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.ADMIN_FEES, takeoffId] })
            const previousAdminFees = queryClient.getQueryData([QUERY_KEYS.ADMIN_FEES, takeoffId])
            queryClient.setQueryData([QUERY_KEYS.ADMIN_FEES, takeoffId], (old: any[]) => {
                if (!old) return old
                return old.filter((v: any) => v.id !== adminFeeId)
            })
            return { previousAdminFees, adminFeeId }
        },
        onError: (error, { takeoffId }, context) => {
            if (context?.previousAdminFees) {
                queryClient.setQueryData([QUERY_KEYS.ADMIN_FEES, takeoffId], context.previousAdminFees)
            }
            toast.error(`Erreur lors de la suppression de la variable`)
        },
        onSettled: (data, error, { takeoffId }) => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FEES, takeoffId] })
            }, 100)
        }
    })
}