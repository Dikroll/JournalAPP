import { storage } from "@/shared/lib/storage"
import { ttl } from "@/shared/config/cache"
import { useEffect } from "react"
import { dashboardApi } from "../api"
import type { ChartPoint } from "../model/types"
import { useDashboardChartsStore } from "../model/store"

const CACHE_KEY_PROGRESS   = "cache:dashboard:chart:progress"
const CACHE_KEY_ATTENDANCE = "cache:dashboard:chart:attendance"

let fetchStarted = false

export function useDashboardCharts() {
  const progress    = useDashboardChartsStore((s) => s.progress)
  const attendance  = useDashboardChartsStore((s) => s.attendance)
  const status      = useDashboardChartsStore((s) => s.status)
  const setProgress   = useDashboardChartsStore((s) => s.setProgress)
  const setAttendance = useDashboardChartsStore((s) => s.setAttendance)
  const setStatus     = useDashboardChartsStore((s) => s.setStatus)

  useEffect(() => {
    const state = useDashboardChartsStore.getState()

    if (state.progress.length > 0 && state.attendance.length > 0) return


    const freshProgress   = storage.get<ChartPoint[]>(CACHE_KEY_PROGRESS)
    const freshAttendance = storage.get<ChartPoint[]>(CACHE_KEY_ATTENDANCE)
    if (freshProgress && freshAttendance) {
      setProgress(freshProgress)
      setAttendance(freshAttendance)
      setStatus("success")
      return
    }

    const staleProgress   = storage.getStale<ChartPoint[]>(CACHE_KEY_PROGRESS)
    const staleAttendance = storage.getStale<ChartPoint[]>(CACHE_KEY_ATTENDANCE)
    if (staleProgress)   setProgress(staleProgress)
    if (staleAttendance) setAttendance(staleAttendance)
    if (staleProgress && staleAttendance) {
      setStatus("success")
    } else {
      setStatus("loading")
    }

    if (fetchStarted) return
    fetchStarted = true

    Promise.all([
      dashboardApi.getProgressChart(),
      dashboardApi.getAttendanceChart(),
    ])
      .then(([progress, attendance]) => {
        setProgress(progress)
        setAttendance(attendance)
        setStatus("success")
        storage.set(CACHE_KEY_PROGRESS,   progress,   ttl.ACTIVITY)
        storage.set(CACHE_KEY_ATTENDANCE, attendance, ttl.ACTIVITY)
      })
      .catch(() => {
        fetchStarted = false 
        setStatus("error")
      })
  }, [])

  return { progress, attendance, status }
}

export function calcTrend(data: ChartPoint[]): number | undefined {
  const last = data[data.length - 1]
  if (!last || last.points == null || last.previous_points == null) return undefined
  if (last.previous_points === 0) return undefined
  return Math.round(((last.points - last.previous_points) / last.previous_points) * 100)
}

export function lastValue(data: ChartPoint[]): number | null {
  return data[data.length - 1]?.points ?? null
}

export function toChartData(data: ChartPoint[]): Array<{ value: number }> {
  return data
    .filter((d) => d.points != null)
    .map((d) => ({ value: d.points as number }))
}