import { useGoalsStore } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { useMemo } from 'react'
import { computeForecast, type Risk, type Trend } from '../lib/forecast'
import {
	normalizeSubjectName,
	useFutureScheduledSubjects,
} from './useScheduledSubjects'

export interface GoalCardData {
	specId: number
	specName: string
	currentAvg: number | null
	forecast: number | null
	target: number | null
	trend: Trend
	risk: Risk
	completed: boolean
	completionReason: 'final_mark' | 'stale' | null
	hasUpcomingLessons: boolean
	lastActivityDate: string | null
}

const RISK_ORDER: Record<Risk, number> = {
	danger: 0,
	watch: 1,
	safe: 2,
	no_goal: 3,
}

const STALE_DAYS = 21

function daysSince(iso: string): number {
	const then = new Date(iso + 'T00:00:00').getTime()
	const now = Date.now()
	if (!Number.isFinite(then)) return 0
	return Math.floor((now - then) / 86_400_000)
}

function assessCompletion(items: Array<{ date: string; marks: unknown }>): {
	completed: boolean
	reason: 'final_mark' | 'stale' | null
	lastDate: string | null
} {
	let hasFinal = false
	let lastDate: string | null = null
	for (const e of items) {
		if (e.marks && typeof e.marks === 'object') {
			const marks = e.marks as Record<string, number | null>
			const finalV = marks.final
			if (typeof finalV === 'number' && finalV > 0) hasFinal = true
		}
		if (lastDate === null || e.date > lastDate) lastDate = e.date
	}
	if (hasFinal) return { completed: true, reason: 'final_mark', lastDate }
	if (lastDate !== null && daysSince(lastDate) > STALE_DAYS) {
		return { completed: true, reason: 'stale', lastDate }
	}
	return { completed: false, reason: null, lastDate }
}

export function useGoalsOverview(): GoalCardData[] {
	const { entries } = useGrades()
	const { subjects } = useSubjects()
	const targets = useGoalsStore(s => s.targets)
	const futureSubjects = useFutureScheduledSubjects()

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

		const allSpecIds = new Set<number>(bySpec.keys())
		for (const key of Object.keys(targets)) {
			const id = Number(key)
			if (Number.isFinite(id)) allSpecIds.add(id)
		}

		const rows: GoalCardData[] = []
		for (const specId of allSpecIds) {
			const items = bySpec.get(specId) ?? []
			const target = targets[specId]?.target ?? null
			const f = computeForecast(items, target)
			const { completed: marksSayDone, reason, lastDate } =
				assessCompletion(items)
			const specName =
				specNameById.get(specId) ?? items[0]?.spec_name ?? `Предмет ${specId}`
			const hasUpcoming = futureSubjects.has(normalizeSubjectName(specName))
			const completed = marksSayDone && !hasUpcoming
			rows.push({
				specId,
				specName,
				currentAvg: f.currentAvg,
				forecast: f.forecast,
				target,
				trend: f.trend,
				risk: f.risk,
				completed,
				completionReason: completed ? reason : null,
				hasUpcomingLessons: hasUpcoming,
				lastActivityDate: lastDate,
			})
		}

		rows.sort((a, b) => {
			if (a.completed !== b.completed) return a.completed ? 1 : -1
			const r = RISK_ORDER[a.risk] - RISK_ORDER[b.risk]
			if (r !== 0) return r
			return a.specName.localeCompare(b.specName, 'ru')
		})

		return rows
	}, [entries, subjects, targets, futureSubjects])
}
