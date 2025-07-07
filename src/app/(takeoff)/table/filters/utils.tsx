import type { FilterFn, Row } from "@tanstack/react-table"
import type { FilterType } from "./types"

export const filterRows: FilterFn<any> = (
    row: Row<any>,
    columnId: string,
    filterValue: { value: any; type: FilterType },
  ): boolean => {
    const cellValue = row.getValue(columnId)
  
    switch (filterValue.type) {
      // String filters
      case "contains":
        return cellValue?.toString().toLowerCase().includes(filterValue.value?.toString().toLowerCase()) ?? true
      case "equals":
        return cellValue?.toString() === filterValue.value?.toString()
      case "startsWith":
        return cellValue?.toString().toLowerCase().startsWith(filterValue.value?.toString().toLowerCase()) ?? false
      case "endsWith":
        return cellValue?.toString().toLowerCase().endsWith(filterValue.value?.toString().toLowerCase()) ?? false
  
      // Number
      case "greaterThan":
        return Number(cellValue) > Number(filterValue.value)
      case "lessThan":
        return Number(cellValue) < Number(filterValue.value)
      case "greaterThanOrEqual":
        return Number(cellValue) >= Number(filterValue.value)
      case "lessThanOrEqual":
        return Number(cellValue) <= Number(filterValue.value)
      case "between": {
        const [min, max] = filterValue.value || []
        return Number(cellValue) >= Number(min) && Number(cellValue) <= Number(max)
      }
  
      // Date
      case "dateEquals":
        return new Date(cellValue as Date).getTime() === new Date(filterValue.value).getTime()
      case "dateBefore":
        return new Date(cellValue as Date).getTime() < new Date(filterValue.value).getTime()
      case "dateAfter":
        return new Date(cellValue as Date).getTime() > new Date(filterValue.value).getTime()
      case "dateBetween": {
        const [start, end] = filterValue.value || []
        const cellTime = new Date(cellValue as Date).getTime()
        return cellTime >= new Date(start).getTime() && cellTime <= new Date(end).getTime()
      }
  
      default:
        return true
    }
  }