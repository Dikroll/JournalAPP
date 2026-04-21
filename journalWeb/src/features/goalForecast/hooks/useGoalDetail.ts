import { useGoal } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { useMemo } from 'react'
import { computeForecast, type ForecastResult } from '../lib/forecast'
import { computeSubjectStats, type SubjectStats } from '../lib/subjectStats'

export interface GoalDetailData {
	specId: number
	specName: string
	entries: ReturnType<typeof useGrades>['entries']
	target: number | null
	forecast: ForecastResult
	stats: SubjectStats
	recent: Array<{ date: string; type: string; value: number }>
}

const RECENT_LIMIT = 8

export function useGoalDetail(specId: number): GoalDetailData {
	const { entries } = useGrades()
	const { subjects } = useSubjects()
	const { target } = useGoal(specId)

	return useMemo(() => {
		const subjectEntries = entries.filter(e => e.spec_id === specId)
		const forecast = computeForecast(subjectEntries, target)
		const stats = computeSubjectStats(subjectEntries)

		const recent = subjectEntries
			.filter(e => e.marks !== null)
			.flatMap(e =>
				e.marks
					? Object.entries(e.marks)
							.filter(([, v]) => v !== null && v !== 0)
							.map(([type, value]) => ({
								date: e.date,
								type,
								value: value as number,
							}))
					: [],
			)
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, RECENT_LIMIT)

		const specName =
			subjects.find(s => s.id === specId)?.name ??
			subjectEntries[0]?.spec_name ??
			`Предмет ${specId}`

		return { specId, specName, entries: subjectEntries, target, forecast, stats, recent }
	}, [entries, subjects, specId, target])
}
