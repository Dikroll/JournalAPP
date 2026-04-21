import { useGoalsStore } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { useMemo } from 'react'
import { computeForecast, type Risk } from '../lib/forecast'
import {
	normalizeSubjectName,
	useFutureScheduledSubjects,
} from './useScheduledSubjects'

const STALE_DAYS = 21

function daysSince(iso: string): number {
	const then = new Date(iso + 'T00:00:00').getTime()
	if (!Number.isFinite(then)) return 0
	return Math.floor((Date.now() - then) / 86_400_000)
}

function isCompleted(items: Array<{ date: string; marks: unknown }>): boolean {
	let lastDate: string | null = null
	for (const e of items) {
		if (e.marks && typeof e.marks === 'object') {
			const finalV = (e.marks as Record<string, number | null>).final
			if (typeof finalV === 'number' && finalV > 0) return true
		}
		if (lastDate === null || e.date > lastDate) lastDate = e.date
	}
	return lastDate !== null && daysSince(lastDate) > STALE_DAYS
}

export interface OverallSummary {
	forecast: number | null
	target: number | null
	risk: Risk
	atRiskCount: number
	totalSubjectsWithGoals: number
}

const RISK_RANK: Record<Risk, number> = { no_goal: -1, safe: 0, watch: 1, danger: 2 }

export function useOverallSummary(): OverallSummary {
	const { entries } = useGrades()
	const { subjects } = useSubjects()
	const targets = useGoalsStore(s => s.targets)
	const futureSubjects = useFutureScheduledSubjects()

	return useMemo(() => {
		const bySubject = new Map<number, typeof entries>()
		for (const e of entries) {
			const arr = bySubject.get(e.spec_id) ?? []
			arr.push(e)
			bySubject.set(e.spec_id, arr)
		}

		const specNameById = new Map<number, string>(
			subjects.map(s => [s.id, s.name]),
		)

		const subjectForecasts: number[] = []
		const subjectTargets: number[] = []
		let worstRisk: Risk = 'safe'
		let atRiskCount = 0
		let totalWithGoals = 0

		const allSpecIds = new Set<number>(bySubject.keys())
		for (const key of Object.keys(targets)) {
			const id = Number(key)
			if (Number.isFinite(id)) allSpecIds.add(id)
		}

		for (const specId of allSpecIds) {
			const items = bySubject.get(specId) ?? []
			const specName =
				specNameById.get(specId) ?? items[0]?.spec_name ?? ''
			const hasUpcoming = futureSubjects.has(normalizeSubjectName(specName))
			if (items.length > 0 && !hasUpcoming && isCompleted(items)) continue
			const target = targets[specId]?.target ?? null
			const f = computeForecast(items, target)
			if (f.forecast !== null) subjectForecasts.push(f.forecast)
			if (target !== null) {
				subjectTargets.push(target)
				totalWithGoals += 1
				if (f.risk === 'watch' || f.risk === 'danger') atRiskCount += 1
				if (f.risk !== 'no_goal' && RISK_RANK[f.risk] > RISK_RANK[worstRisk]) {
					worstRisk = f.risk
				}
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
	}, [entries, subjects, targets, futureSubjects])
}
