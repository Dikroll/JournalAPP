import { formatMonthShort } from "@/shared/utils/dateUtils"
import { useTooltipTimeout } from "@/shared/utils/toollipUtils"
import type { ChartPoint } from "../model/types"
import { calcTrend, toChartData } from "./useDashboardCharts"

export interface ChartDataPoint {
  value: number | null
  label: string
}

function toChartDataWithLabel(points: ChartPoint[]): ChartDataPoint[] {
  return toChartData(points).map((d, i) => ({
    ...d,
    label: formatMonthShort(points.filter((p) => p.points != null)[i]?.date ?? ""),
  }))
}

export function useGradesCharts(progress: ChartPoint[], attendance: ChartPoint[]) {
  return {
    progressData: toChartDataWithLabel(progress),
    attendanceData: toChartDataWithLabel(attendance),
    progressTrend: calcTrend(progress),
    attendanceTrend: calcTrend(attendance),
    progressTooltip: useTooltipTimeout(),
    attendanceTooltip: useTooltipTimeout(),
  }
}