import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { ChartPoint } from "../model/types"

export const dashboardApi = {
  getProgressChart: () =>
    api
      .get<ChartPoint[]>(apiConfig.DASHBOARD_CHART_PROGRESS)
      .then((r) => r.data),

  getAttendanceChart: () =>
    api
      .get<ChartPoint[]>(apiConfig.DASHBOARD_CHART_ATTENDANCE)
      .then((r) => r.data),
}