import type { ChartDataPoint, ChartPoint } from '../model/types'
import { calcTrend, toChartData } from '../utils/chartUtils'

export function useGradesCharts(
	progress: ChartPoint[],
	attendance: ChartPoint[],
) {
	return {
		progressData: toChartData(progress) as ChartDataPoint[],
		attendanceData: toChartData(attendance) as ChartDataPoint[],
		progressTrend: calcTrend(progress),
		attendanceTrend: calcTrend(attendance),
	}
}
