"use client"

import { useEffect, useRef } from "react"

export function useClickOutside<T extends HTMLElement = HTMLElement>(handler: () => void, enabled = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handler, enabled])

  return ref
}