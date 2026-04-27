import type { FutureExamItem } from '@/entities/exam'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import {
	buildExamReminderDrafts,
	DEFAULT_EXAM_REMINDER_CONFIG,
	type ExamReminderConfig,
	type ExamReminderDraft,
} from './reminderPlanner'
import {
	clearExamReminderState,
	readExamReminderState,
	writeExamReminderState,
} from './reminderStorage'

const ANDROID_CHANNEL_ID = 'exam-reminders'

async function ensurePermissionGranted(): Promise<boolean> {
	if (!Capacitor.isNativePlatform?.()) return false

	try {
		const current = await LocalNotifications.checkPermissions()
		if (current.display === 'granted') return true

		const requested = await LocalNotifications.requestPermissions()
		return requested.display === 'granted'
	} catch (error) {
		console.warn('[exam-reminders] permission request failed', error)
		return false
	}
}

async function ensureAndroidChannel() {
	if (Capacitor.getPlatform?.() !== 'android') return

	try {
		await LocalNotifications.createChannel({
			id: ANDROID_CHANNEL_ID,
			name: 'Уведомления об экзаменах',
			description: 'Напоминания о предстоящих экзаменах',
			importance: 4,
			visibility: 1,
		})
	} catch (error) {
		console.warn('[exam-reminders] channel init failed', error)
	}
}

function toPluginNotification(draft: ExamReminderDraft) {
	return {
		id: draft.id,
		title: draft.title,
		body: draft.body,
		schedule: {
			at: draft.at,
			allowWhileIdle: true,
		},
		channelId: ANDROID_CHANNEL_ID,
		extra: draft.extra,
	}
}

async function cancelScheduledByIds(ids: number[]) {
	if (ids.length === 0) return
	try {
		await LocalNotifications.cancel({
			notifications: ids.map(id => ({ id })),
		})
	} catch (error) {
		console.warn('[exam-reminders] cancel failed', error)
	}
}

export async function syncExamReminders(
	exams: FutureExamItem[],
	config: ExamReminderConfig = DEFAULT_EXAM_REMINDER_CONFIG,
) {
	if (!Capacitor.isNativePlatform?.()) return

	const granted = await ensurePermissionGranted()
	if (!granted) return

	await ensureAndroidChannel()

	const drafts = buildExamReminderDrafts(exams, new Date(), config)
	const prevState = readExamReminderState()
	await cancelScheduledByIds(prevState.scheduledIds)

	if (drafts.length === 0) {
		writeExamReminderState({
			scheduledIds: [],
			lastSyncedAt: Date.now(),
		})
		return
	}

	try {
		await LocalNotifications.schedule({
			notifications: drafts.map(toPluginNotification),
		})

		writeExamReminderState({
			scheduledIds: drafts.map(item => item.id),
			lastSyncedAt: Date.now(),
		})
	} catch (error) {
		console.warn('[exam-reminders] schedule failed', error)
	}
}

export async function cancelScheduledExamReminders() {
	if (Capacitor.isNativePlatform?.()) {
		const state = readExamReminderState()
		await cancelScheduledByIds(state.scheduledIds)
	}

	clearExamReminderState()
}
