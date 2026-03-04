import { useUserStore } from "@/entities/user/model/store"
import { useCallback, useEffect, useRef } from "react"
import { homeworkApi } from "../api"
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from "./store"

const ALL_STATUSES = [0, 1, 2, 3, 5] as const
const AUTO_REFRESH_MS = 90 * 60 * 1000
const CACHE_TTL_MS = 15 * 60 * 1000   
const BATCH_SIZE = 2
const BATCH_DELAY_MS = 400

export function useHomework() {
  const user = useUserStore((s) => s.user)

  const {
    items, expandedStatuses, counters, status, error, filterStatus, loadedAt,
    setItems, appendItems, setExpanded, setCounters, setStatus, setError, setFilter, setLoadedAt,
  } = useHomeworkStore()

  const loadingRef = useRef(false)

  const loadPreviews = useCallback(async (force = false) => {
    if (!user?.group?.id) return
    if (loadingRef.current) return

    // если данные свежие — не перезагружаем (если не force)
    if (!force && loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return

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
      setLoadedAt(Date.now())
      setStatus("success")
    } catch {
      setError("Не удалось загрузить домашние задания")
      setStatus("error")
    } finally {
      loadingRef.current = false
    }
  }, [user?.group?.id, loadedAt])

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
      // silent
    }
  }, [user?.group?.id])

  const refresh = useCallback(() => {
    loadPreviews(true)
  }, [loadPreviews])

  useEffect(() => {
    if (!user?.group?.id) return
    loadPreviews()
  }, [user?.group?.id, loadPreviews])

  useEffect(() => {
    if (!user?.group?.id) return
    const timer = setInterval(() => loadPreviews(true), AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [user?.group?.id, loadPreviews])

  return {
    items, expandedStatuses, counters, status, error,
    filterStatus, loadMore, refresh, setFilter, PREVIEW_SIZE,
  }
}