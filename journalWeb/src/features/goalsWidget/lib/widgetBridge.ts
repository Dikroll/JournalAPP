import { Capacitor, registerPlugin } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { widgetConfig } from '@/shared/config/widgetConfig'
import {
	buildGoalsWidgetPayload,
	type BuildGoalsPayloadInput,
	type GoalsWidgetPayload,
} from './payload'

const GOALS_PAYLOAD_FILE = 'widgets/goals-payload.json'

type WidgetBridgePlugin = {
	saveSchedule: (options: { payload: string }) => Promise<void>
	clearSchedule: () => Promise<void>
	saveGoals: (options: { payload: string }) => Promise<void>
	clearGoals: () => Promise<void>
}

const WidgetBridge = Capacitor.isNativePlatform()
	? registerPlugin<WidgetBridgePlugin>('WidgetBridge')
	: null

export function getGoalsWidgetPayload(
	input: BuildGoalsPayloadInput,
): GoalsWidgetPayload & { meta: { deepLinkUrl: string } } {
	return {
		...buildGoalsWidgetPayload(input),
		meta: { deepLinkUrl: widgetConfig.deepLinkGoalsUrl },
	}
}

async function writeGoalsPayloadFile(payload: string) {
	try {
		await Filesystem.writeFile({
			path: GOALS_PAYLOAD_FILE,
			data: payload,
			directory: Directory.Data,
			encoding: Encoding.UTF8,
			recursive: true,
		})
	} catch {}
}

async function deleteGoalsPayloadFile() {
	try {
		await Filesystem.deleteFile({
			path: GOALS_PAYLOAD_FILE,
			directory: Directory.Data,
		})
	} catch {}
}

export async function syncGoalsWidget(input: BuildGoalsPayloadInput) {
	const payload = JSON.stringify(getGoalsWidgetPayload(input))
	await writeGoalsPayloadFile(payload)
	if (!WidgetBridge) return
	try {
		await WidgetBridge.saveGoals({ payload })
	} catch {}
}

export async function clearGoalsWidget() {
	await deleteGoalsPayloadFile()
	if (!WidgetBridge) return
	try {
		await WidgetBridge.clearGoals()
	} catch {}
}
