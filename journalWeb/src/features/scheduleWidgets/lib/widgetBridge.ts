import { Capacitor, registerPlugin } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import type { LessonItem } from '@/entities/schedule'
import { widgetConfig } from '@/shared/config/widgetConfig'
import { buildScheduleWidgetPayload, type ScheduleWidgetStats } from './payload'

const WIDGET_PAYLOAD_FILE = 'widgets/schedule-payload.json'

type WidgetBridgePlugin = {
	saveSchedule: (options: { payload: string }) => Promise<void>
	clearSchedule: () => Promise<void>
}

const WidgetBridge = Capacitor.isNativePlatform()
	? registerPlugin<WidgetBridgePlugin>('WidgetBridge')
	: null

export function getScheduleWidgetPayload(
	lessons: LessonItem[],
	tomorrowLessons: LessonItem[] = [],
	stats: ScheduleWidgetStats | null = null,
	weeklyMap: Record<string, LessonItem[]> = {},
): string {
	return JSON.stringify({
		...buildScheduleWidgetPayload(
			lessons,
			new Date(),
			tomorrowLessons,
			stats,
			weeklyMap,
		),
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
	} catch {}
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
	stats: ScheduleWidgetStats | null = null,
	weeklyMap: Record<string, LessonItem[]> = {},
) {
	const payload = getScheduleWidgetPayload(
		lessons,
		tomorrowLessons,
		stats,
		weeklyMap,
	)
	await syncWidgetPayloadFile(payload)
	if (!WidgetBridge) return
	try {
		await WidgetBridge.saveSchedule({ payload })
	} catch {}
}

export async function clearScheduleWidgets() {
	await clearWidgetPayloadFile()
	if (!WidgetBridge) return
	try {
		await WidgetBridge.clearSchedule()
	} catch {}
}
