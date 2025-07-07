import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useCallback, useRef } from "react"

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