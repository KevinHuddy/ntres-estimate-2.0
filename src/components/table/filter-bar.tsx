"use client"

import type { Table } from "@tanstack/react-table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export interface FilterConfig<TData> {
  key: keyof TData
  label: string
  type: "select" | "input" | "date" | "toggle"
  options?: string[]
  placeholder?: string
  toggleLabel?: string
}

interface FilterBarProps<TData> {
  table: Table<TData>
  filterConfig: FilterConfig<TData>[]
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  searchPlaceholder?: string
}

export function FilterBar<TData>({
  table,
  filterConfig,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = "Search...",
}: FilterBarProps<TData>) {
  return (
    <div className="flex gap-4 items-end flex-wrap">
      {/* Global Search */}
      <div className="flex flex-col space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder={searchPlaceholder}
          value={globalFilter ?? ""}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="w-[300px]"
        />
      </div>

      {/* Dynamic Filters */}
      {filterConfig.map((filter) => (
        <div key={filter.key as string} className="flex flex-col space-y-2">
          <Label htmlFor={`filter-${filter.key as string}`}>Filter by {filter.label}</Label>
          {filter.type === "select" ? (
            <Select
              value={(table.getColumn(filter.key as string)?.getFilterValue() as string) ?? ""}
              onValueChange={(value) =>
                table.getColumn(filter.key as string)?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={filter.placeholder || `All ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : filter.type === "input" ? (
            <Input
              id={`filter-${filter.key as string}`}
              placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
              value={(table.getColumn(filter.key as string)?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn(filter.key as string)?.setFilterValue(e.target.value)}
              className="w-[200px]"
            />
          ) : filter.type === "toggle" ? (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${filter.key as string}`}
                checked={(table.getColumn(filter.key as string)?.getFilterValue() as boolean) ?? false}
                onCheckedChange={(checked) =>
                  table.getColumn(filter.key as string)?.setFilterValue(checked ? true : undefined)
                }
              />
              <Label htmlFor={`filter-${filter.key as string}`} className="text-sm font-normal">
                {filter.toggleLabel || filter.label}
              </Label>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
