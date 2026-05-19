import { useState, useCallback, useEffect } from 'react'
import { apiClient } from './api'

export function useAnalysis() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (sequence: string, type: 'raw' | 'fasta') => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.analyze({ sequence, type })
      setResults(response.results)
      return response.results
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { results, isLoading, error, analyze }
}

export function useAPIHealth() {
  const [isHealthy, setIsHealthy] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await apiClient.isAvailable()
        setIsHealthy(healthy)
      } catch {
        setIsHealthy(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { isHealthy, isChecking }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error writing to localStorage: ${error}`)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
