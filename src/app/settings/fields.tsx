"use client"

import { useBoards } from "@/hooks/queries"
import { SearchSelectCombobox } from "@/components/search-select-combobox"

export function MondayBoardCombobox({
    onSelect,
    value,
}: {
    onSelect: (board: any) => void,
    value: any,
}) {
    const { data: boards, isLoading: boardsLoading } = useBoards();  
  
    return (
        <SearchSelectCombobox
            options={boards?.map((board: any) => ({
                value: board.id,
                label: board.name,
            }))}
            onSelect={onSelect}
            value={value}
            placeholder="Choisir un tableau"
            searchPlaceholder="Rechercher un tableau"
            isLoading={boardsLoading}
        />
    )
}