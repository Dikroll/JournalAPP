import { useCallback, useEffect, useRef } from "react"
import { gradesApi } from "../api"
import { useGradesStore } from "../model/store"

const AUTO_REFRESH_MS = 90 * 60 * 1000

export function useGrades() {
  const {
    entries, status, error,
    setEntries, setStatus, setError, setLoadedAt,
  } = useGradesStore()

  const loadingRef = useRef(false)

  const load = useCallback(async (force = false) => {
    if (loadingRef.current) return
    if (!force && status === "success") return

    loadingRef.current = true
    setStatus("loading")
    setError(null)

    try {
      const data = await gradesApi.getAll()
      setEntries(data)
      setLoadedAt(Date.now())
      setStatus("success")
    } catch {
      setError("Не удалось загрузить оценки")
      setStatus("error")
    } finally {
      loadingRef.current = false
    }
  }, [status])

  const refresh = useCallback(() => load(true), [load])

  useEffect(() => { load() }, [])

  useEffect(() => {
    const timer = setInterval(() => load(true), AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  return { entries, status, error, refresh }
}