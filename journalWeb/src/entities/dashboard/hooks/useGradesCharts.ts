import { useMemo } from 'react'
import type { ChartDataPoint, ChartPoint } from '../model/types'
import { calcTrend, toChartData } from '../utils/chartUtils'

export function useGradesCharts(
	progress: ChartPoint[],
	attendance: ChartPoint[],
) {
	const progressData = useMemo(
		() => toChartData(progress) as ChartDataPoint[],
		[progress],
	)
	const attendanceData = useMemo(
		() => toChartData(attendance) as ChartDataPoint[],
		[attendance],
	)
	const progressTrend = useMemo(() => calcTrend(progress), [progress])
	const attendanceTrend = useMemo(() => calcTrend(attendance), [attendance])

	return { progressData, attendanceData, progressTrend, attendanceTrend }
}
