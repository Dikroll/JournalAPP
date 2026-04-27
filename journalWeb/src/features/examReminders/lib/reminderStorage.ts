const REMINDER_STATE_KEY = 'mobile:exam-reminders:state'

interface ExamReminderState {
	scheduledIds: number[]
	lastSyncedAt: number | null
}

const EMPTY_STATE: ExamReminderState = {
	scheduledIds: [],
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
		console.warn('[exam-reminders] storage write failed', error)
	}
}

export function readExamReminderState(): ExamReminderState {
	return readJson<ExamReminderState>(REMINDER_STATE_KEY) ?? EMPTY_STATE
}

export function writeExamReminderState(state: ExamReminderState) {
	writeJson(REMINDER_STATE_KEY, state)
}

export function clearExamReminderState() {
	localStorage.removeItem(REMINDER_STATE_KEY)
}
