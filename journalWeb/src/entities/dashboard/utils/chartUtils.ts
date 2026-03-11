import { formatMonthShort } from '@/shared/utils'
import type { ChartDataPoint, ChartPoint } from '../model/types'

export function calcTrend(data: ChartPoint[]): number | undefined {
	const last = data[data.length - 1]
	if (!last || last.points == null || last.previous_points == null)
		return undefined
	if (last.previous_points === 0) return undefined
	return Math.round(
		((last.points - last.previous_points) / last.previous_points) * 100,
	)
}

export function lastValue(data: ChartPoint[]): number | null {
	return data[data.length - 1]?.points ?? null
}

export function toChartData(data: ChartPoint[]): ChartDataPoint[] {
	return data
		.filter((d): d is ChartPoint & { points: number } => d.points != null)
		.map(d => ({
			value: d.points,
			label: formatMonthShort(d.date),
		}))
}
