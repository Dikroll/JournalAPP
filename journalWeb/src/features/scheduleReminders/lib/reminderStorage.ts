import type { LessonItem } from '@/entities/schedule'
import { getScheduleTimeInfo } from '@/entities/schedule'
import { toMinutes } from '@/shared/hooks'
import { getTodayString } from '@/shared/utils'

const REMINDER_STATE_KEY = 'mobile:schedule-reminders:state'
const SCHEDULE_SNAPSHOT_KEY = 'mobile:schedule:snapshot'

interface ReminderState {
	scheduledIds: number[]
	lastSyncedDate: string | null
	lastSyncedAt: number | null
}

interface ScheduleSnapshot {
	date: string
	savedAt: number
	lessons: LessonItem[]
	nextLesson: LessonItem | null
	summary: string
}

const EMPTY_STATE: ReminderState = {
	scheduledIds: [],
	lastSyncedDate: null,
	lastSyncedAt: null,
}

function readJson<T>(key: string): T | null {
	try {
		const raw = localStorage.getItem(key)
		if (!raw) return null
		return JSON.parse(raw) as T
	} catch {
		return null
	}
}

function writeJson(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch (error) {
		console.warn('[schedule-reminders] storage write failed', error)
	}
}

export function readReminderState(): ReminderState {
	return readJson<ReminderState>(REMINDER_STATE_KEY) ?? EMPTY_STATE
}

export function writeReminderState(state: ReminderState) {
	writeJson(REMINDER_STATE_KEY, state)
}

export function clearReminderState() {
	localStorage.removeItem(REMINDER_STATE_KEY)
}

export function saveScheduleSnapshot(lessons: LessonItem[]) {
	const date = lessons[0]?.date ?? getTodayString()
	const now = new Date()
	const info = getScheduleTimeInfo(lessons, toMinutes(now.toTimeString().slice(0, 5)))
	const snapshot: ScheduleSnapshot = {
		date,
		savedAt: now.getTime(),
		lessons,
		nextLesson: info.nextLesson ?? info.currentLesson ?? null,
		summary: info.label,
	}

	writeJson(SCHEDULE_SNAPSHOT_KEY, snapshot)
}

export function clearScheduleSnapshot() {
	localStorage.removeItem(SCHEDULE_SNAPSHOT_KEY)
}
