"use client"

import { MondayClient } from "@ntr.dev/monday-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMonday } from "@/components/monday-context-provider";
import { QUERY_KEYS } from "@/utils/constants";
import { getBoardSettings } from "@/lib/utils";

const client = new MondayClient();

export interface CreateQuoteData {
  name?: string;
  total: number;
  project_subitem: string;
  project: string;
  takeoff: string;
}

export function useCreateQuote() {
  const { settings } = useMonday();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateQuoteData) => {
      try {
        const { cols: quoteCols, boardId: quoteBoardId } = getBoardSettings(settings, "QUOTES");
        const { cols: lineItemCols, boardId: lineItemBoardId } = getBoardSettings(settings, "LINE_ITEMS");

        // Create the quote
        const response = await client.items.create({
          itemName: data.name || `Quote for ${data.takeoff}`,
          boardId: quoteBoardId,
          columnValues: {
            [quoteCols.TOTAL]: data.total.toString(),
            [quoteCols.PROJECT_SUBITEM]: data.project_subitem,
            [quoteCols.PROJECT]: data.project,
            [quoteCols.TAKEOFF]: data.takeoff,
          }
        });

        // Get line items for this takeoff
        const lineItems = await client.items.listByColumnValues({
          boardId: lineItemBoardId,
          columns: {
            [lineItemCols.LINKED_TAKEOFF]: data.takeoff
          },
          columnIds: ['name']
        });

        // Update all line items to link to the new quote
        await Promise.all(lineItems.map(async (item: any) => {
          await client.items.update({
            boardId: lineItemBoardId,
            itemId: item.id,
            columnValues: {
              [lineItemCols.LINKED_QUOTE]: response.toString(),
            }
          });
        }));

        toast.success("Quote created successfully");
        return response;
      } catch (error) {
        console.error("❌ Error creating quote", error);
        toast.error("Failed to create quote");
        throw error;
      }
    },
    onSuccess: (_, { takeoff, project }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES, project] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINE_ITEMS, takeoff] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAKEOFF, takeoff] });
    },
  });
} 