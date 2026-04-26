import type { LessonItem } from '@/entities/schedule'
import { pageConfig, widgetConfig } from '@/shared/config'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import {
	buildLessonReminderDrafts,
	type ReminderNotificationDraft,
} from './reminderPlanner'
import {
	clearReminderState,
	clearScheduleSnapshot,
	readReminderState,
	saveScheduleSnapshot,
	writeReminderState,
} from './reminderStorage'

const ANDROID_CHANNEL_ID = 'schedule-reminders'

let pluginsLoaded = false
let listenersBound = false

function loadPlugins() {
	if (pluginsLoaded) return
	pluginsLoaded = true

	if (!Capacitor.isNativePlatform?.()) {
		return
	}
}

function openScheduleRoute(extra?: {
	route?: string
	date?: string
	lesson?: number
}) {
	const route = extra?.route || pageConfig.schedule
	const search = new URLSearchParams()
	if (extra?.date) search.set('date', extra.date)
	if (typeof extra?.lesson === 'number') {
		search.set('lesson', String(extra.lesson))
	}

	const suffix = search.toString()
	window.location.hash = suffix ? `#${route}?${suffix}` : `#${route}`
}

function handleDeepLinkUrl(url: string) {
	try {
		const parsed = new URL(url)
		if (parsed.protocol !== `${widgetConfig.deepLinkScheme}:`) return

		if (parsed.host === 'schedule' || parsed.pathname === '/schedule') {
			openScheduleRoute({ route: pageConfig.schedule })
			return
		}
		if (parsed.host === 'goals' || parsed.pathname === '/goals') {
			window.location.hash = `#${pageConfig.goals}`
		}
	} catch (error) {
		console.warn('[schedule-reminders] invalid deep link', error)
	}
}

export async function initReminderListeners() {
	loadPlugins()
	if (!Capacitor.isNativePlatform?.() || listenersBound) {
		return
	}

	listenersBound = true

	try {
		await App.addListener('appUrlOpen', (event: { url?: string }) => {
			if (event.url) handleDeepLinkUrl(event.url)
		})
		await LocalNotifications.addListener(
			'localNotificationActionPerformed',
			(event: {
				notification?: {
					extra?: { route?: string; date?: string; lesson?: number }
				}
			}) => {
				openScheduleRoute(event.notification?.extra)
			},
		)
	} catch (error) {
		console.warn('[schedule-reminders] listener init failed', error)
	}
}

async function ensurePermissionGranted(): Promise<boolean> {
	loadPlugins()
	if (!Capacitor.isNativePlatform?.()) return false

	try {
		const current = await LocalNotifications.checkPermissions()
		if (current.display === 'granted') return true

		const requested = await LocalNotifications.requestPermissions()
		return requested.display === 'granted'
	} catch (error) {
		console.warn('[schedule-reminders] permission request failed', error)
		return false
	}
}

async function ensureAndroidChannel() {
	if (Capacitor.getPlatform?.() !== 'android') return

	try {
		await LocalNotifications.createChannel({
			id: ANDROID_CHANNEL_ID,
			name: 'Напоминания о парах',
			description: 'Уведомления перед началом пар',
			importance: 5,
			visibility: 1,
		})
	} catch (error) {
		console.warn('[schedule-reminders] channel init failed', error)
	}
}

function toPluginNotification(draft: ReminderNotificationDraft) {
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
		console.warn('[schedule-reminders] cancel failed', error)
	}
}

export async function syncScheduleReminders(lessons: LessonItem[]) {
	loadPlugins()
	if (!Capacitor.isNativePlatform?.()) return

	const granted = await ensurePermissionGranted()
	if (!granted) return

	await ensureAndroidChannel()

	const drafts = buildLessonReminderDrafts(lessons)
	const prevState = readReminderState()
	await cancelScheduledByIds(prevState.scheduledIds)

	if (drafts.length === 0) {
		writeReminderState({
			scheduledIds: [],
			lastSyncedDate: lessons[0]?.date ?? null,
			lastSyncedAt: Date.now(),
		})
		return
	}

	try {
		await LocalNotifications.schedule({
			notifications: drafts.map(toPluginNotification),
		})

		writeReminderState({
			scheduledIds: drafts.map(item => item.id),
			lastSyncedDate: lessons[0]?.date ?? null,
			lastSyncedAt: Date.now(),
		})
	} catch (error) {
		console.warn('[schedule-reminders] schedule failed', error)
	}
}

export function syncScheduleSnapshot(lessons: LessonItem[]) {
	saveScheduleSnapshot(lessons)
}

export async function cancelScheduledReminders() {
	loadPlugins()
	if (Capacitor.isNativePlatform?.()) {
		const state = readReminderState()
		await cancelScheduledByIds(state.scheduledIds)
	}

	clearReminderState()
}

export async function clearScheduleReminders() {
	clearScheduleSnapshot()
	await cancelScheduledReminders()
}
