import type { FutureExamItem } from '@/entities/exam'
import type { ExamFrequency } from '../model/store'

export const DEFAULT_EXAM_START_DAYS = 7
export const DEFAULT_EXAM_NOTIFY_HOUR = 17

export interface ExamReminderConfig {
	enabled: boolean
	dayBeforeEnabled: boolean
	dailyEnabled: boolean
	startDays: number
	frequency: ExamFrequency
	notifyHour: number
}

export const DEFAULT_EXAM_REMINDER_CONFIG: ExamReminderConfig = {
	enabled: true,
	dayBeforeEnabled: true,
	dailyEnabled: true,
	startDays: DEFAULT_EXAM_START_DAYS,
	frequency: 'daily',
	notifyHour: DEFAULT_EXAM_NOTIFY_HOUR,
}

export interface ExamReminderDraft {
	id: number
	title: string
	body: string
	at: Date
	extra: {
		route: string
		date: string
		spec: string
		kind: 'exam-day-before' | 'exam-daily'
	}
}

function getReminderId(
	examDate: string,
	spec: string,
	daysUntil: number,
	kind: string,
): number {
	let hash = 991
	const source = `${examDate}:${spec}:${daysUntil}:${kind}`
	for (let i = 0; i < source.length; i++) {
		hash = (hash * 31 + source.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

function toExamDate(date: string): Date {
	return new Date(`${date}T00:00:00`)
}

function startOfDay(d: Date): Date {
	const x = new Date(d)
	x.setHours(0, 0, 0, 0)
	return x
}

function diffDays(from: Date, to: Date): number {
	const ms = startOfDay(to).getTime() - startOfDay(from).getTime()
	return Math.round(ms / 86_400_000)
}

function makeNotifyAt(date: Date, hour: number): Date {
	const d = new Date(date)
	d.setHours(hour, 0, 0, 0)
	return d
}

function getDayBeforeBody(spec: string, examDate: string): string {
	return `${spec} — ${formatExamDate(examDate)}. Удачи!`
}

function getDailyBody(spec: string, daysUntil: number): string {
	return `${spec} через ${daysUntil} ${pluralizeDays(daysUntil)}. Время готовиться.`
}

function pluralizeDays(n: number): string {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return 'день'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня'
	return 'дней'
}

function formatExamDate(date: string): string {
	const d = toExamDate(date)
	return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function buildExamReminderDrafts(
	exams: FutureExamItem[],
	now: Date = new Date(),
	config: ExamReminderConfig = DEFAULT_EXAM_REMINDER_CONFIG,
): ExamReminderDraft[] {
	if (!config.enabled) return []

	const drafts: ExamReminderDraft[] = []

	for (const exam of exams) {
		const examDate = toExamDate(exam.date)
		const daysUntilExam = diffDays(now, examDate)
		if (daysUntilExam <= 0) continue

		if (config.dayBeforeEnabled && daysUntilExam >= 1) {
			const triggerDate = new Date(examDate)
			triggerDate.setDate(triggerDate.getDate() - 1)
			const at = makeNotifyAt(triggerDate, config.notifyHour)

			drafts.push({
				id: getReminderId(exam.date, exam.spec, 1, 'exam-day-before'),
				title: 'Завтра экзамен!',
				body: getDayBeforeBody(exam.spec, exam.date),
				at,
				extra: {
					route: '/grades',
					date: exam.date,
					spec: exam.spec,
					kind: 'exam-day-before',
				},
			})
		}

		if (config.dailyEnabled) {
			const startD = Math.min(config.startDays, daysUntilExam)

			for (let d = startD; d >= 2; d--) {
				if (config.frequency === 'alternate' && (config.startDays - d) % 2 !== 0) {
					continue
				}

				const triggerDate = new Date(examDate)
				triggerDate.setDate(triggerDate.getDate() - d)
				const at = makeNotifyAt(triggerDate, config.notifyHour)

				drafts.push({
					id: getReminderId(exam.date, exam.spec, d, 'exam-daily'),
					title: 'Скоро экзамен',
					body: getDailyBody(exam.spec, d),
					at,
					extra: {
						route: '/grades',
						date: exam.date,
						spec: exam.spec,
						kind: 'exam-daily',
					},
				})
			}
		}
	}

	return drafts.filter(item => item.at.getTime() > now.getTime() + 30_000)
}
