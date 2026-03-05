import { useEffect, useState } from "react"
import { dashboardApi } from "../api"
import type { ChartPoint } from "../model/types"

interface ChartsState {
  progress: ChartPoint[]
  attendance: ChartPoint[]
  status: "idle" | "loading" | "success" | "error"
}

export function useDashboardCharts() {
  const [state, setState] = useState<ChartsState>({
    progress: [],
    attendance: [],
    status: "idle",
  })

  useEffect(() => {
    setState((s) => ({ ...s, status: "loading" }))

    Promise.all([
      dashboardApi.getProgressChart(),
      dashboardApi.getAttendanceChart(),
    ])
      .then(([progress, attendance]) => {
        setState({ progress, attendance, status: "success" })
      })
      .catch(() => {
        setState((s) => ({ ...s, status: "error" }))
      })
  }, [])

  return state
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