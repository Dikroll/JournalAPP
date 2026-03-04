import { useUserStore } from "@/entities/user/model/store"
import { useCallback, useEffect, useRef } from "react"
import { homeworkApi } from "../api"
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from "../model/store"

const AUTO_REFRESH_MS = 90 * 60 * 1000
const CACHE_TTL_MS    = 15 * 60 * 1000

export function useHomework() {
  const groupId = useUserStore((s) => s.user?.group?.id)

  const {
    items, expandedStatuses, counters, status, error, filterStatus,
    setItems, appendItems, setExpanded, setCounters,
    setStatus, setError, setFilter, setLoadedAt,
  } = useHomeworkStore()

  const loadingRef = useRef(false)

  const loadAll = useCallback(async (force = false) => {
    if (!groupId) return
    if (loadingRef.current) return

    const { loadedAt } = useHomeworkStore.getState()
    if (!force && loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return

    loadingRef.current = true
    setStatus("loading")
    setError(null)

    try {
      // один запрос вместо 6 последовательных
      const { counters, items } = await homeworkApi.getAll(groupId)

      setCounters(counters)
      Object.entries(items).forEach(([statusKey, list]) => {
        setItems(Number(statusKey), list)
      })

      setLoadedAt(Date.now())
      setStatus("success")
    } catch {
      setError("Не удалось загрузить домашние задания")
      setStatus("error")
    } finally {
      loadingRef.current = false
    }
  }, [groupId])

  const loadMore = useCallback(async (statusKey: number) => {
    if (!groupId) return
    const currentPage = useHomeworkStore.getState().pages[statusKey] ?? 1
    const nextPage = currentPage + 1
    try {
      const newItems = await homeworkApi.getByStatus(statusKey, groupId, nextPage)
      appendItems(statusKey, newItems, nextPage)
      if (newItems.length < PAGE_SIZE) {
        setExpanded(statusKey, true)
      }
    } catch {
      // silent
    }
  }, [groupId, appendItems, setExpanded])

  const refresh = useCallback(() => loadAll(true), [loadAll])

  useEffect(() => {
    if (!groupId) return
    loadAll()
  }, [groupId, loadAll])

  useEffect(() => {
    if (!groupId) return
    const timer = setInterval(() => loadAll(true), AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [groupId, loadAll])

  return {
    items, expandedStatuses, counters, status, error,
    filterStatus, loadMore, refresh, setFilter, PREVIEW_SIZE,
  }
}