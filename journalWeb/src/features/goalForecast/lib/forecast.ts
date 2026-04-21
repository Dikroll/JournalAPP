import type { GradeEntry } from '@/entities/grades'

export type Risk = 'no_goal' | 'safe' | 'watch' | 'danger'
export type Trend = 'up' | 'flat' | 'down'

export interface ForecastResult {
	currentAvg: number | null
	forecast: number | null
	trend: Trend
	risk: Risk
	gapToGoal: number | null
}

const WATCH_THRESHOLD = 0.3
const TREND_THRESHOLD = 0.3
const TREND_WINDOW = 4

function flatMarks(entries: GradeEntry[]): number[] {
	return entries
		.filter(e => e.marks !== null)
		.flatMap(e =>
			Object.values(e.marks!).filter(
				(v): v is number => v !== null && v !== 0,
			),
		)
}

function mean(values: number[]): number | null {
	if (!values.length) return null
	return values.reduce((s, v) => s + v, 0) / values.length
}

export function currentAverage(entries: GradeEntry[]): number | null {
	return mean(flatMarks(entries))
}

function orderedMarks(entries: GradeEntry[]): number[] {
	return [...entries]
		.sort((a, b) => a.date.localeCompare(b.date))
		.flatMap(e =>
			e.marks
				? Object.values(e.marks).filter(
						(v): v is number => v !== null && v !== 0,
					)
				: [],
		)
}

export function computeTrend(entries: GradeEntry[]): Trend {
	const marks = orderedMarks(entries)
	if (marks.length < TREND_WINDOW * 2) return 'flat'

	const last = marks.slice(-TREND_WINDOW)
	const prev = marks.slice(-TREND_WINDOW * 2, -TREND_WINDOW)
	const diff = (mean(last) ?? 0) - (mean(prev) ?? 0)

	if (diff > TREND_THRESHOLD) return 'up'
	if (diff < -TREND_THRESHOLD) return 'down'
	return 'flat'
}

export function computeRisk(
	target: number | null,
	forecast: number | null,
): Risk {
	if (target === null || forecast === null) return 'no_goal'
	if (forecast >= target) return 'safe'
	if (forecast >= target - WATCH_THRESHOLD) return 'watch'
	return 'danger'
}

export function computeForecast(
	entries: GradeEntry[],
	target: number | null,
): ForecastResult {
	const currentAvg = currentAverage(entries)
	const forecast = currentAvg
	const trend = computeTrend(entries)
	const risk = computeRisk(target, forecast)
	const gapToGoal =
		target !== null && forecast !== null ? target - forecast : null

	return { currentAvg, forecast, trend, risk, gapToGoal }
}
