import { useCallback, useRef } from "react"
import { gradesApi } from "../api/index"
import { useGradesStore } from "../model/store"

const CACHE_TTL_MS = 15 * 60 * 1000

export function useGradesBySubject() {
  const { bySubject, setSubjectEntries, setSubjectStatus } = useGradesStore()
  const loadingRef = useRef<Set<number>>(new Set())

  const loadSubject = useCallback(async (specId: number, force = false) => {
    if (loadingRef.current.has(specId)) return

    const existing = useGradesStore.getState().bySubject[specId]
    if (!force && existing?.loadedAt && Date.now() - existing.loadedAt < CACHE_TTL_MS) return

    loadingRef.current.add(specId)
    setSubjectStatus(specId, "loading")

    try {
      const data = await gradesApi.getBySubject(specId)
      setSubjectEntries(specId, data)
    } catch {
      setSubjectStatus(specId, "error")
    } finally {
      loadingRef.current.delete(specId)
    }
  }, [])

  return { bySubject, loadSubject }
}
