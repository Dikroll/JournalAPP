import { useUserStore } from "@/entities/user/model/store"
import { useCallback, useEffect, useRef } from "react"
import { homeworkApi } from "../api"
import { PREVIEW_SIZE, useHomeworkStore } from "./store"

const ALL_STATUSES = [0, 1, 2, 3, 5] as const

// Авто-рефреш каждые 90 минут — только первые страницы, без 429
const AUTO_REFRESH_MS = 90 * 60 * 1000

export function useHomework() {
  const user = useUserStore((s) => s.user)

  const {
    items,
    expandedStatuses,
    counters,
    status,
    error,
    setItems,
    setExpanded,
    setCounters,
    setStatus,
    setError,
  } = useHomeworkStore()

  const didLoadRef = useRef(false)
  const loadingRef = useRef(false)

  // ── Быстрая загрузка: только page=1 каждого статуса ─────────────────────────
  const loadPreviews = useCallback(async () => {
    if (!user?.group?.id) return
    if (loadingRef.current) return

    loadingRef.current = true
    setStatus("loading")
    setError(null)

    try {
      const [countersData, ...pages] = await Promise.all([
        homeworkApi.getCounters(),
        ...ALL_STATUSES.map((s) => homeworkApi.getByStatus(s, user.group!.id, 1)),
      ])

      ALL_STATUSES.forEach((statusKey, idx) => {
        setItems(statusKey, pages[idx])
      })

      setCounters(countersData)
      setStatus("success")
    } catch {
      setError("Не удалось загрузить домашние задания")
      setStatus("error")
    } finally {
      loadingRef.current = false
    }
  }, [user?.group?.id])

  // ── Загрузить ВСЕ страницы одного статуса (кнопка «Показать все») ────────────
  const loadAll = useCallback(
    async (statusKey: number) => {
      if (!user?.group?.id) return
      try {
        const all = await homeworkApi.getAllByStatus(statusKey, user.group.id)
        setItems(statusKey, all)
      } catch {
        // тихо — первая страница уже есть
      } finally {
        setExpanded(statusKey, true)
      }
    },
    [user?.group?.id],
  )

  // ── Ручное обновление (кнопка «Обновить») ────────────────────────────────────
  const refresh = useCallback(() => {
    didLoadRef.current = false
    loadPreviews()
  }, [loadPreviews])

  // ── Первоначальная загрузка ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.group?.id) return
    if (didLoadRef.current) return
    didLoadRef.current = true
    loadPreviews()
  }, [user?.group?.id, loadPreviews])

  // ── Авто-рефреш каждые 90 мин (только превью, не трогает раскрытые списки) ───
  useEffect(() => {
    if (!user?.group?.id) return
    const timer = setInterval(loadPreviews, AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [user?.group?.id, loadPreviews])

  return {
    items,
    expandedStatuses,
    counters,
    status,
    error,
    loadAll,
    refresh,
    PREVIEW_SIZE,
  }
}