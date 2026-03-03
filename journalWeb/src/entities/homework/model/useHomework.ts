import { useUserStore } from "@/entities/user/model/store"
import { useCallback, useEffect, useRef } from "react"
import { homeworkApi } from "../api"
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from "./store"

const ALL_STATUSES = [0, 1, 2, 3, 5] as const
const AUTO_REFRESH_MS = 90 * 60 * 1000
const BATCH_SIZE = 2
const BATCH_DELAY_MS = 400

export function useHomework() {
  const user = useUserStore((s) => s.user)

  const {
    items, expandedStatuses, counters, status, error, filterStatus,
    setItems, appendItems, setExpanded, setCounters, setStatus, setError, setFilter,
  } = useHomeworkStore()

  const didLoadRef = useRef(false)
  const loadingRef = useRef(false)

  const loadPreviews = useCallback(async () => {
    if (!user?.group?.id) return
    if (loadingRef.current) return
    loadingRef.current = true
    setStatus("loading")
    setError(null)
    try {
      const countersData = await homeworkApi.getCounters()
      setCounters(countersData)

      for (let i = 0; i < ALL_STATUSES.length; i += BATCH_SIZE) {
        const batch = ALL_STATUSES.slice(i, i + BATCH_SIZE)
        const pages = await Promise.all(
          batch.map((s) => homeworkApi.getByStatus(s, user.group!.id, 1))
        )
        batch.forEach((statusKey, idx) => setItems(statusKey, pages[idx]))
        if (i + BATCH_SIZE < ALL_STATUSES.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
        }
      }
      setStatus("success")
    } catch {
      setError("Не удалось загрузить домашние задания")
      setStatus("error")
    } finally {
      loadingRef.current = false
    }
  }, [user?.group?.id])

  const loadMore = useCallback(async (statusKey: number) => {
    if (!user?.group?.id) return
    const currentPage = useHomeworkStore.getState().pages[statusKey] ?? 1
    const nextPage = currentPage + 1
    try {
      const newItems = await homeworkApi.getByStatus(statusKey, user.group.id, nextPage)
      appendItems(statusKey, newItems, nextPage)
    
      if (newItems.length < PAGE_SIZE) {
        setExpanded(statusKey, true)
      }
    } catch {

    }
  }, [user?.group?.id])

  const refresh = useCallback(() => {
    didLoadRef.current = false
    loadPreviews()
  }, [loadPreviews])

  useEffect(() => {
    if (!user?.group?.id) return
    if (didLoadRef.current) return
    didLoadRef.current = true
    loadPreviews()
  }, [user?.group?.id, loadPreviews])

  useEffect(() => {
    if (!user?.group?.id) return
    const timer = setInterval(loadPreviews, AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [user?.group?.id, loadPreviews])

  return {
    items, expandedStatuses, counters, status, error,
    filterStatus, loadMore, refresh, setFilter, PREVIEW_SIZE,
  }
}