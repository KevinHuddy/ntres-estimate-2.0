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
        onMutate: async ({ name, columns, takeoffId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId] })
            
            // Snapshot the previous value
            const previousLineItems = queryClient.getQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId])
            
            // Generate a temporary ID for the new item
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            console.log({name, columns, takeoffId})
            
            // Create optimistic line item with parsed column values
            const optimisticItem = {
                id: tempId, // Temporary ID to distinguish it
                name,
                category: columns[cols.CATEGORY] || '',
                type: columns[cols.TYPE]?.toString() || '',
                unit_type: columns[cols.UNIT_TYPE] || '',
                qty_takeoff: Number(columns[cols.QTY_TAKEOFF]) || 0,
                cost_takeoff: Number(columns[cols.COST_TAKEOFF]) || 0,
                linked_supplier: columns[cols.LINKED_SUPPLIER] || '',
                values: columns[cols.VALUES] ? columns[cols.VALUES] : [],
                waste: Number(columns[cols.WASTE]) || 0,
                multiplier: Number(columns[cols.MULTIPLIER]) || 0,
                divider: Number(columns[cols.DIVIDER]) || 0,
                mo_qty: Number(columns[cols.MO_QTY]) || 0,
                mo_hours: Number(columns[cols.MO_HOURS]) || 0,
                mo_days: Number(columns[cols.MO_DAYS]) || 0,
                linked_activity_code: columns[cols.LINKED_ACTIVITY_CODE] || '',
                linked_template_line_item: columns[cols.LINKED_TEMPLATE_LINE_ITEM] || '',
                linked_takeoff: takeoffId,
                values_total: 0, // Will be calculated by the server
                // Mark as optimistic to handle UI states
                _isOptimistic: true,
            }

            console.log({optimisticItem})
            
            // Optimistically update the cache
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], (old: any[]) => {
                if (!old) return [optimisticItem]
                return [...old, optimisticItem]
            })
            
            return { previousLineItems, tempId }
        },
        onError: (error, { takeoffId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousLineItems) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], context.previousLineItems)
            }
            toast.error("Erreur lors de la création de l'élément")
        },
        onSuccess: (data, { takeoffId }, context) => {
            // Update the cache with the real item data, replacing the temporary one
            if (data && context?.tempId) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], (old: any[]) => {
                    if (!old) return old
                    return old.map((item: any) => 
                        item.id === context.tempId 
                            ? { ...item, id: (data as any)?.id || data, _isOptimistic: false } // Replace temp ID with real ID
                            : item
                    )
                })
            }
        },
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
        onMutate: async ({ id, columns, takeoffId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId] })
            
            // Snapshot the previous value
            const previousLineItems = queryClient.getQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId])
            
            // Optimistically update the cache
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], (old: any[]) => {
                if (!old) return old
                return old.map((item: any) => {
                    if (item.id === id) {
                        return {
                            ...item,
                            name: columns.name || item.name,
                            category: columns[cols.CATEGORY] || item.category,
                            type: columns[cols.TYPE] || item.type,
                            unit_type: columns[cols.UNIT_TYPE] || item.unit_type,
                            qty_takeoff: columns[cols.QTY_TAKEOFF] ? Number(columns[cols.QTY_TAKEOFF]) : item.qty_takeoff,
                            cost_takeoff: columns[cols.COST_TAKEOFF] ? Number(columns[cols.COST_TAKEOFF]) : item.cost_takeoff,
                            linked_supplier: columns[cols.LINKED_SUPPLIER] || item.linked_supplier,
                            values: columns[cols.VALUES] ? columns[cols.VALUES] : item.values,
                            waste: columns[cols.WASTE] ? Number(columns[cols.WASTE]) : item.waste,
                            multiplier: columns[cols.MULTIPLIER] ? Number(columns[cols.MULTIPLIER]) : item.multiplier,
                            divider: columns[cols.DIVIDER] ? Number(columns[cols.DIVIDER]) : item.divider,
                            mo_qty: columns[cols.MO_QTY] ? Number(columns[cols.MO_QTY]) : item.mo_qty,
                            mo_hours: columns[cols.MO_HOURS] ? Number(columns[cols.MO_HOURS]) : item.mo_hours,
                            mo_days: columns[cols.MO_DAYS] ? Number(columns[cols.MO_DAYS]) : item.mo_days,
                            linked_activity_code: columns[cols.LINKED_ACTIVITY_CODE] || item.linked_activity_code,
                            linked_template_line_item: columns[cols.LINKED_TEMPLATE_LINE_ITEM] || item.linked_template_line_item,
                            _isOptimistic: true,
                        }
                    }
                    return item
                })
            })
            
            return { previousLineItems }
        },
        onError: (error, { takeoffId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousLineItems) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], context.previousLineItems)
            }
            toast.error("Erreur lors de la mise à jour de l'élément")
        },
        onSuccess: (data, { takeoffId }) => {
            // Mark optimistic update as complete
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], (old: any[]) => {
                if (!old) return old
                return old.map((item: any) => ({
                    ...item,
                    _isOptimistic: false
                }))
            })
        },
        // onSettled: (_, __, { takeoffId }) => {
        //     // Disabled aggressive invalidation to prevent re-render loops
        //     queryClient.invalidateQueries({
        //         queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId]
        //     })
        // }
    })
}

export const useUpdateLineItemsForQuoteMutation = () => {
    const { settings } = useMonday();
    const { cols, boardId} = getBoardSettings(settings, "LINE_ITEMS")
    
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            columns,
            quoteId
        }: {
            id: string
            columns: Record<string, string>
            quoteId: string
        }) => {
            console.log({id, columns, quoteId})
            try {
                const response = await client.items.update({
                    itemId: id,
                    boardId: boardId,
                    createLabels: true,
                    columnValues: {
                        ...columns,
                        [cols.LINKED_QUOTE]: quoteId.toString(),
                    }
                })
                return response
            } catch (error) {
                console.error(error)
                toast.error("Failed to update line items")
                return null
            }
        },
        onMutate: async ({ id, columns, quoteId }) => {
            // Cancel any outgoing refetches for quote-specific queries
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.LINE_ITEMS, 'quote', quoteId] })
            
            // Snapshot the previous value
            const previousLineItems = queryClient.getQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId])
            
            // Optimistically update the cache
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId], (old: any[]) => {
                if (!old) return old
                return old.map((item: any) => {
                    if (item.id === id) {
                        return {
                            ...item,
                            name: columns.name || item.name,
                            category: columns[cols.CATEGORY] || item.category,
                            type: columns[cols.TYPE] || item.type,
                            unit_type: columns[cols.UNIT_TYPE] || item.unit_type,
                            qty_quote: columns[cols.QTY_QUOTE] ? Number(columns[cols.QTY_QUOTE]) : item.qty_quote,
                            cost_quote: columns[cols.COST_QUOTE] ? Number(columns[cols.COST_QUOTE]) : item.cost_quote,
                            linked_supplier: columns[cols.LINKED_SUPPLIER] || item.linked_supplier,
                            _isOptimistic: true,
                        }
                    }
                    return item
                })
            })
            
            return { previousLineItems }
        },
        onError: (error, { quoteId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousLineItems) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId], context.previousLineItems)
            }
            toast.error("Erreur lors de la mise à jour de l'élément")
        },
        onSuccess: (data, { quoteId }) => {
            // Mark optimistic update as complete
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId], (old: any[]) => {
                if (!old) return old
                return old.map((item: any) => ({
                    ...item,
                    _isOptimistic: false
                }))
            })
        },
    })
}

export const useCreateLineItemsForQuoteMutation = () => {
    const { settings } = useMonday();
    const { cols, boardId} = getBoardSettings(settings, "LINE_ITEMS")
    
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            columns,
            quoteId
        }: {
            name: string
            columns: Record<string, string>
            quoteId: string
        }) => {
            console.log({name, columns, quoteId})
            try {
                const response = await client.items.create({
                    itemName: name,
                    boardId: boardId,
                    createLabels: true,
                    columnValues: {
                        ...columns, 
                        [cols.LINKED_QUOTE]: quoteId.toString(),
                    }
                })
                return response
            } catch (error) {
                console.error(error)    
                toast.error("Failed to create line items")
                return null
            }
        },
        onMutate: async ({ name, columns, quoteId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.LINE_ITEMS, 'quote', quoteId] })
            
            // Snapshot the previous value
            const previousLineItems = queryClient.getQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId])
            
            // Generate a temporary ID for the new item
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            console.log({name, columns, quoteId})
            
            // Create optimistic line item with parsed column values
            const optimisticItem = {
                id: tempId, // Temporary ID to distinguish it
                name,
                category: columns[cols.CATEGORY] || '',
                type: columns[cols.TYPE]?.toString() || '',
                unit_type: columns[cols.UNIT_TYPE] || '',
                qty_quote: Number(columns[cols.QTY_QUOTE]) || 0,
                cost_quote: Number(columns[cols.COST_QUOTE]) || 0,
                linked_supplier: columns[cols.LINKED_SUPPLIER] || '',
                linked_quote: quoteId,
                // Mark as optimistic to handle UI states
                _isOptimistic: true,
            }

            console.log({optimisticItem})
            
            // Optimistically update the cache
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId], (old: any[]) => {
                if (!old) return [optimisticItem]
                return [...old, optimisticItem]
            })
            
            return { previousLineItems, tempId }
        },
        onError: (error, { quoteId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousLineItems) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId], context.previousLineItems)
            }
            toast.error("Erreur lors de la création de l'élément")
        },
        onSuccess: (data, { quoteId }, context) => {
            // Update the cache with the real item data, replacing the temporary one
            if (data && context?.tempId) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, 'quote', quoteId], (old: any[]) => {
                    if (!old) return old
                    return old.map((item: any) => 
                        item.id === context.tempId 
                            ? { ...item, id: (data as any)?.id || data, _isOptimistic: false } // Replace temp ID with real ID
                            : item
                    )
                })
            }
        },
    })
}

export const useDeleteLineItemMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            takeoffId
        }: {
            id: string
            takeoffId: string
        }) => {
            console.log({id, takeoffId})
            try {
                const response = await client.items.delete({
                    itemId: id,
                })
                return response
            } catch (error) {
                console.error(error)
                toast.error("Failed to delete line items")
                return null
            }
        },
        onMutate: async ({ id, takeoffId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId] })
            
            // Snapshot the previous value
            const previousLineItems = queryClient.getQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId])
            
            // Optimistically remove the item from the cache
            queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], (old: any[]) => {
                if (!old) return old
                return old.filter((item: any) => item.id !== id)
            })
            
            return { previousLineItems }
        },
        onError: (error, { takeoffId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousLineItems) {
                queryClient.setQueryData([QUERY_KEYS.LINE_ITEMS, takeoffId], context.previousLineItems)
            }
            toast.error("Erreur lors de la suppression de l'élément")
        },
        // onSettled: (_, __, { takeoffId }) => {
        //     // Disabled aggressive invalidation to prevent re-render loops
        //     queryClient.invalidateQueries({
        //         queryKey: [QUERY_KEYS.LINE_ITEMS, takeoffId]
        //     })
        // }
    })
}