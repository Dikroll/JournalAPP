import { Capacitor, registerPlugin } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import type { LessonItem } from '@/entities/schedule'
import { widgetConfig } from '@/shared/config/widgetConfig'
import { useWidgetDebugStore } from '../model/debugStore'
import { buildScheduleWidgetPayload } from './payload'

const WIDGET_PAYLOAD_FILE = 'widgets/schedule-payload.json'

type WidgetBridgeSaveResult = {
	saved?: boolean
	defaultsWritten?: boolean
	fileWritten?: boolean
	appGroupId?: string
}

type WidgetBridgePlugin = {
	saveSchedule: (options: {
		payload: string
	}) => Promise<WidgetBridgeSaveResult>
	clearSchedule: () => Promise<void>
}

const WidgetBridge = Capacitor.isNativePlatform()
	? registerPlugin<WidgetBridgePlugin>('WidgetBridge')
	: null

function reportEnvironment() {
	const platform = Capacitor.getPlatform()
	const plugins = Object.keys(
		(Capacitor as unknown as { Plugins?: object }).Plugins ?? {},
	)
	useWidgetDebugStore.getState().setEnvironment(platform, plugins)
	useWidgetDebugStore
		.getState()
		.setBridgeAvailable(WidgetBridge !== null && plugins.includes('WidgetBridge'))
}

reportEnvironment()

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(
			() => reject(new Error(`${label} timed out after ${ms}ms`)),
			ms,
		)
		promise.then(
			value => {
				clearTimeout(timer)
				resolve(value)
			},
			err => {
				clearTimeout(timer)
				reject(err)
			},
		)
	})
}

export function getScheduleWidgetPayload(
	lessons: LessonItem[],
	tomorrowLessons: LessonItem[] = [],
): string {
	return JSON.stringify({
		...buildScheduleWidgetPayload(lessons, new Date(), tomorrowLessons),
		meta: {
			deepLinkUrl: widgetConfig.deepLinkScheduleUrl,
		},
	})
}

async function syncWidgetPayloadFile(payload: string) {
	try {
		await Filesystem.writeFile({
			path: WIDGET_PAYLOAD_FILE,
			data: payload,
			directory: Directory.Data,
			encoding: Encoding.UTF8,
			recursive: true,
		})
	} catch (error) {
		console.warn('[schedule-widgets] file sync failed', error)
	}
}

async function clearWidgetPayloadFile() {
	try {
		await Filesystem.deleteFile({
			path: WIDGET_PAYLOAD_FILE,
			directory: Directory.Data,
		})
	} catch {}
}

export async function syncScheduleWidgets(
	lessons: LessonItem[],
	tomorrowLessons: LessonItem[] = [],
) {
	const store = useWidgetDebugStore.getState()
	reportEnvironment()

	store.setStage('building payload')
	const payload = getScheduleWidgetPayload(lessons, tomorrowLessons)

	store.setStage('writing file via Filesystem')
	await syncWidgetPayloadFile(payload)

	if (!WidgetBridge) {
		store.setStage('bridge unavailable')
		store.setResult(payload, null, 'web platform or plugin not registered')
		return
	}

	store.setStage('calling saveSchedule')
	try {
		const result = await withTimeout(
			WidgetBridge.saveSchedule({ payload }),
			5000,
			'saveSchedule',
		)
		store.setStage('saveSchedule resolved')
		store.setResult(payload, result as Record<string, unknown>, null)
	} catch (error) {
		store.setStage('saveSchedule failed')
		const msg = error instanceof Error ? error.message : JSON.stringify(error)
		store.setResult(payload, null, msg)
	}
}

export async function clearScheduleWidgets() {
	await clearWidgetPayloadFile()
	if (!WidgetBridge) return
	try {
		await withTimeout(WidgetBridge.clearSchedule(), 5000, 'clearSchedule')
	} catch (error) {
		console.warn('[schedule-widgets] clear failed', error)
	}
}
