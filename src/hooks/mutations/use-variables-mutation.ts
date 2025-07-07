import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMonday } from "@/components/monday-context-provider";
import { getBoardSettings } from "@/lib/utils";

const client = new MondayClient()

export const useCreateVariable = () => {
    const { settings } = useMonday()
    const variables = getBoardSettings(settings, 'VARIABLES')
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ 
            takeoffId,
            name,
            value,
            unit
        }: { 
            takeoffId: string,
            name: string,
            value: number,
            unit?: string
        }) => {
            const response = await client.items.create({
                itemName: name,
                boardId: variables.boardId,
                columnValues: {
                    [variables.cols.LINKED_TAKEOFF]: takeoffId,
                    [variables.cols.VALUE]: value,
                    [variables.cols.UNIT_TYPE]: unit || null
                }
            })
            return response
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSettled: (data, error, { takeoffId }) => {
            queryClient.invalidateQueries({ queryKey: ['variables', takeoffId] })  
        }
    })
}

export const useDeleteVariable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            takeoffId,
            variableId
        }: {
            takeoffId: string
            variableId: string
        }) => {
            try {
                const response = await client.items.delete({
                    itemId: variableId
                })
                return response
            } catch (error) {
                console.error(error)
                toast.error(`Failed to delete variable from takeoff ${takeoffId}`)
                return null
            }
        },
        onMutate: async ({ takeoffId, variableId }) => {
            await queryClient.cancelQueries({ queryKey: ['variables', takeoffId] })
            const previousVariables = queryClient.getQueryData(['variables', takeoffId])
            queryClient.setQueryData(['variables', takeoffId], (old: any[]) => {
                if (!old) return old
                return old.filter((v: any) => v.id !== variableId)
            })
            return { previousVariables, variableId }
        },
        onError: (error, { takeoffId }, context) => {
            if (context?.previousVariables) {
                queryClient.setQueryData(['variables', takeoffId], context.previousVariables)
            }
            toast.error(`Erreur lors de la suppression de la variable`)
        },
        onSettled: (data, error, { takeoffId }) => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['variables', takeoffId] })
            }, 100)
        }
    })
}

export const useUpdateVariable = () => {
    const { settings, context } = useMonday();

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            variableId,
            columns
        }: {
            variableId: string
            columns: Record<string, any>
            name?: string
        }) => {
            const columnValues = Object.entries(columns).reduce((acc, [key, value]) => {
                // Skip the name field as it's handled separately
                let columnId = null;
                
                // Map form field names to column IDs
                if (key === 'value' || key === 'VALUE') {
                    columnId = settings.COLUMNS.VARIABLES.VALUE;
                } else if (key === 'unit' || key === 'UNIT_TYPE') {
                    columnId = settings.COLUMNS.VARIABLES.UNIT_TYPE;
                } else if (key === 'name' || key === 'NAME') {
                    columnId = 'name';
                }
                
                if (columnId && value !== undefined && value !== null) {
                    acc[columnId] = value.toString();
                }
                return acc
            }, {} as Record<string, string>);

            const response = await client.items.update({
                itemId: variableId,
                boardId: settings.BOARDS.VARIABLES,
                columnValues: columnValues
            })
            
            return response
        },
        onError: (error, { variableId }) => {
            toast.error(`Failed to update variable ${variableId}`)
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['variables', context?.itemId] })
            }, 100)
        }
    })
}