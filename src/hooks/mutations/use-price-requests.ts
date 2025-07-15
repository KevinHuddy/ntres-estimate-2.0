"use client"

import { QUERY_KEYS } from "@/utils/constants";
import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMonday } from "@/components/monday-context-provider";
import { getBoardSettings } from "@/lib/utils";
import { toast } from "sonner";

const client = new MondayClient()

// Mock mutation for creating price requests
export const useCreatePriceRequest = () => {
    const { settings } = useMonday()
    const { cols, boardId} = getBoardSettings(settings, "PRICE_REQUEST")
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            supplierId,
            supplierName,
            takeoffId,
            projectId,
        }: {
            supplierId: string;
            supplierName: string;
            takeoffId: string;
            projectId?: string;
        }) => {
            return await client.items.create({
                itemName: supplierName,
                boardId: boardId,
                createLabels: true,
                columnValues: {
                    [cols.LINKED_TAKEOFF]: takeoffId,
                    [cols.LINKED_SUPPLIER]: supplierId,
                    [cols.LINKED_PROJECT]: Number(projectId),
                }
            })
        },
        onSettled: (data, error, {takeoffId}) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRICE_REQUEST, takeoffId] })
        },
        onError: (error) => {
            console.error("Failed to create price request:", error);
            toast.error("Failed to create price request");
        },
    });
};

// Mock mutation for creating price request subitems
export const useCreatePriceRequestSubitem = () => {
    return useMutation({
        mutationFn: async ({
            parentItemId,
            itemName,
            category,
            type,
            qty,
            unitType,
            lineId,
            takeoffId,
        }: {
            parentItemId: string;
            itemName: string;
            category: string;
            type: string;
            qty: number;
            unitType: string;
            lineId: string;
            takeoffId: string;
        }) => {
            // Mock API call - replace with actual implementation
            console.log("Creating price request subitem:", { 
                parentItemId, 
                itemName, 
                category, 
                type, 
                qty, 
                unitType, 
                lineId, 
                takeoffId 
            });
            
            return await client.items.create({
                itemName: itemName,
                boardId: boardId,
                createLabels: true,
                columnValues: {
                    [cols.LINKED_TAKEOFF]: takeoffId,
                    [cols.LINKED_SUPPLIER]: supplierId,
                    [cols.LINKED_PROJECT]: projectId,
                }
            })
        },
        onSuccess: (data) => {
            console.log("Price request subitem created successfully:", data);
            // You can add query invalidation here if needed
        },
        onError: (error) => {
            console.error("Failed to create price request subitem:", error);
            toast.error("Failed to create price request subitem");
        },
    });
}; 