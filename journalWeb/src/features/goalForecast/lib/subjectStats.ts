import type { GradeEntry } from '@/entities/grades'
import type { GradeType } from '@/shared/types'

export interface Totals {
	lessons: number
	withMarks: number
	withoutMarks: number
}

export interface Attendance {
	present: number
	late: number
	absent: number
	ratePercent: number
}

export type Distribution = Record<1 | 2 | 3 | 4 | 5, number>

export interface ByTypeItem {
	type: GradeType
	count: number
	avg: number
}

export interface PeriodItem {
	label: string
	avg: number
	count: number
}

export type Period = 'week' | 'month'

export interface SubjectStats {
	total: Totals
	attendance: Attendance
	distribution: Distribution
	byType: ByTypeItem[]
	byPeriod: PeriodItem[]
}

const RU_MONTH_SHORT = [
	'янв', 'фев', 'мар', 'апр', 'май', 'июн',
	'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

function flatMarks(entry: GradeEntry): number[] {
	if (!entry.marks) return []
	return Object.values(entry.marks).filter(
		(v): v is number => v !== null && v !== 0,
	)
}

export function computeTotals(entries: GradeEntry[]): Totals {
	const lessons = entries.length
	const withMarks = entries.filter(e => flatMarks(e).length > 0).length
	return { lessons, withMarks, withoutMarks: lessons - withMarks }
}

export function computeAttendance(entries: GradeEntry[]): Attendance {
	const present = entries.filter(e => e.attended === 'present').length
	const late = entries.filter(e => e.attended === 'late').length
	const absent = entries.filter(e => e.attended === 'absent').length
	const total = entries.length
	const ratePercent = total === 0 ? 0 : Math.round(((present + late) / total) * 100)
	return { present, late, absent, ratePercent }
}

export function computeDistribution(entries: GradeEntry[]): Distribution {
	const dist: Distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
	for (const e of entries) {
		for (const v of flatMarks(e)) {
			const bucket = Math.round(v)
			if (
				bucket === 1 ||
				bucket === 2 ||
				bucket === 3 ||
				bucket === 4 ||
				bucket === 5
			) {
				dist[bucket] += 1
			}
		}
	}
	return dist
}

export function computeByType(entries: GradeEntry[]): ByTypeItem[] {
	const buckets: Record<GradeType, number[]> = {
		control: [], homework: [], lab: [], classwork: [], practical: [], final: [],
	}
	for (const e of entries) {
		if (!e.marks) continue
		for (const [type, value] of Object.entries(e.marks) as [GradeType, number | null][]) {
			if (value !== null && value !== 0) buckets[type].push(value)
		}
	}
	const order: GradeType[] = ['homework', 'lab', 'classwork', 'control', 'practical', 'final']
	return order
		.filter(t => buckets[t].length > 0)
		.map(t => ({
			type: t,
			count: buckets[t].length,
			avg: buckets[t].reduce((s, v) => s + v, 0) / buckets[t].length,
		}))
}

function isoWeekKey(date: string): string {
	const d = new Date(date + 'T00:00:00Z')
	const target = new Date(d)
	const dayNum = (d.getUTCDay() + 6) % 7
	target.setUTCDate(target.getUTCDate() - dayNum + 3)
	const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
	const week = 1 + Math.round(
		((target.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7,
	)
	return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function weekLabel(key: string): string {
	const n = parseInt(key.split('-W')[1] ?? '0', 10)
	return `нед ${n}`
}

function monthKey(date: string): string {
	return date.slice(0, 7)
}

function monthLabel(key: string): string {
	const m = parseInt(key.split('-')[1] ?? '1', 10)
	return RU_MONTH_SHORT[m - 1] ?? key
}

export function computeByPeriod(entries: GradeEntry[], period: Period): PeriodItem[] {
	if (entries.length === 0) return []

	const key = period === 'week' ? isoWeekKey : monthKey
	const label = period === 'week' ? weekLabel : monthLabel

	const buckets = new Map<string, number[]>()
	for (const e of entries) {
		const k = key(e.date)
		const marks = flatMarks(e)
		if (marks.length === 0) continue
		const existing = buckets.get(k) ?? []
		existing.push(...marks)
		buckets.set(k, existing)
	}

	return [...buckets.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, values]) => ({
			label: label(k),
			count: values.length,
			avg: values.reduce((s, v) => s + v, 0) / values.length,
		}))
}

export function computeSubjectStats(entries: GradeEntry[]): SubjectStats {
	return {
		total: computeTotals(entries),
		attendance: computeAttendance(entries),
		distribution: computeDistribution(entries),
		byType: computeByType(entries),
		byPeriod: computeByPeriod(entries, 'week'),
	}
}
