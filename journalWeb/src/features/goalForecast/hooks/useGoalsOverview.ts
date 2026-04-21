import { useGoalsStore } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { useMemo } from 'react'
import { computeForecast, type Risk, type Trend } from '../lib/forecast'

export interface GoalCardData {
	specId: number
	specName: string
	currentAvg: number | null
	forecast: number | null
	target: number | null
	trend: Trend
	risk: Risk
}

const RISK_ORDER: Record<Risk, number> = {
	danger: 0,
	watch: 1,
	safe: 2,
	no_goal: 3,
}

export function useGoalsOverview(): GoalCardData[] {
	const { entries } = useGrades()
	const { subjects } = useSubjects()
	const targets = useGoalsStore(s => s.targets)

	return useMemo(() => {
		const bySpec = new Map<number, typeof entries>()
		for (const e of entries) {
			const arr = bySpec.get(e.spec_id) ?? []
			arr.push(e)
			bySpec.set(e.spec_id, arr)
		}

		const specNameById = new Map<number, string>(
			subjects.map(s => [s.id, s.name]),
		)

		const rows: GoalCardData[] = []
		for (const [specId, items] of bySpec) {
			const target = targets[specId]?.target ?? null
			const f = computeForecast(items, target)
			rows.push({
				specId,
				specName:
					specNameById.get(specId) ?? items[0]?.spec_name ?? `Предмет ${specId}`,
				currentAvg: f.currentAvg,
				forecast: f.forecast,
				target,
				trend: f.trend,
				risk: f.risk,
			})
		}

		rows.sort((a, b) => {
			const r = RISK_ORDER[a.risk] - RISK_ORDER[b.risk]
			if (r !== 0) return r
			return a.specName.localeCompare(b.specName, 'ru')
		})

		return rows
	}, [entries, subjects, targets])
}
