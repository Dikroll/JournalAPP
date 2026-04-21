import { useGoalsStore } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useMemo } from 'react'
import { computeForecast, type Risk } from '../lib/forecast'

export interface OverallSummary {
	forecast: number | null
	target: number | null
	risk: Risk
	atRiskCount: number
	totalSubjectsWithGoals: number
}

const RISK_RANK: Record<Risk, number> = { safe: 0, no_goal: 1, watch: 2, danger: 3 }

export function useOverallSummary(): OverallSummary {
	const { entries } = useGrades()
	const targets = useGoalsStore(s => s.targets)

	return useMemo(() => {
		const bySubject = new Map<number, typeof entries>()
		for (const e of entries) {
			const arr = bySubject.get(e.spec_id) ?? []
			arr.push(e)
			bySubject.set(e.spec_id, arr)
		}

		const subjectForecasts: number[] = []
		const subjectTargets: number[] = []
		let worstRisk: Risk = 'safe'
		let atRiskCount = 0
		let totalWithGoals = 0

		for (const [specId, items] of bySubject) {
			const target = targets[specId]?.target ?? null
			const f = computeForecast(items, target)
			if (f.forecast !== null) subjectForecasts.push(f.forecast)
			if (target !== null) {
				subjectTargets.push(target)
				totalWithGoals += 1
				if (f.risk === 'watch' || f.risk === 'danger') atRiskCount += 1
				if (RISK_RANK[f.risk] > RISK_RANK[worstRisk]) worstRisk = f.risk
			}
		}

		const avg = (vs: number[]) =>
			vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : null

		return {
			forecast: avg(subjectForecasts),
			target: avg(subjectTargets),
			risk: totalWithGoals === 0 ? 'no_goal' : worstRisk,
			atRiskCount,
			totalSubjectsWithGoals: totalWithGoals,
		}
	}, [entries, targets])
}
