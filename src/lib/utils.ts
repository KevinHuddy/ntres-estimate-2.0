import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useCallback, useRef } from "react"
import { isNumber } from "radash"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: any[]) => {
      if ( timeoutRef.current ) {
          clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}

export function formatCurrency(amount: number) {
  const number = isNumber(amount) ? amount : 0
  
  return new Intl.NumberFormat(
    "fr-CA",
    {
      style: "currency",
      currency: "CAD",
    }
  ).format(number)
}

export function getBoardSettings(settings: any, boardName: string) {
  const board = settings?.BOARDS?.[boardName]
  const columns = settings?.COLUMNS?.[boardName]

  return {
    boardId: board || "",
    cols: columns ? Object.keys(columns).reduce((acc: any, key: string) => {
      acc[key] = columns[key]
      return acc
    }, {}) : {}
  }
}