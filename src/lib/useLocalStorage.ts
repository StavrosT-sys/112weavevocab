// src/lib/useLocalStorage.ts
import { useState } from 'react'

export const useLocalStorage = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  })
  
  const set = (v: T) => {
    localStorage.setItem(key, JSON.stringify(v))
    setValue(v)
  }
  
  return [value, set] as const
}
