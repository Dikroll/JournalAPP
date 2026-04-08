import { API_BASE_URL } from '@/shared/config/env'

export interface AppReleaseInfo {
	version: string
	build: number
	apk_url: string
	changelog: string
}

export interface ChangelogFeedEntry {
	id: string
	version: string
	date?: string
	items: string[]
}

function normalizeVersion(version: string): number[] {
	return version
		.split('.')
		.map(part => Number.parseInt(part, 10))
		.map(part => (Number.isFinite(part) ? part : 0))
}

export function compareVersions(left: string, right: string): number {
	const leftParts = normalizeVersion(left)
	const rightParts = normalizeVersion(right)
	const maxLength = Math.max(leftParts.length, rightParts.length)

	for (let index = 0; index < maxLength; index += 1) {
		const leftPart = leftParts[index] ?? 0
		const rightPart = rightParts[index] ?? 0

		if (leftPart > rightPart) return 1
		if (leftPart < rightPart) return -1
	}

	return 0
}

export function isRemoteReleaseNewer(params: {
	currentBuild: number
	currentVersion: string
	serverBuild: number
	serverVersion: string
}) {
	const { currentBuild, currentVersion, serverBuild, serverVersion } = params

	if (Number.isFinite(serverBuild) && Number.isFinite(currentBuild)) {
		if (serverBuild > currentBuild) return true
		if (serverBuild < currentBuild) return false
	}

	return compareVersions(serverVersion, currentVersion) > 0
}

export function parseChangelogItems(changelog: string): string[] {
	const items = changelog
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => line.replace(/^[-*•]\s*/, ''))

	if (items.length === 0) {
		return ['Описание обновления скоро появится']
	}

	return items
}

export function toChangelogFeedEntry(
	release: AppReleaseInfo,
	date?: string,
): ChangelogFeedEntry {
	return {
		id: `v${release.version}-b${release.build}`,
		version: release.version,
		date,
		items: parseChangelogItems(release.changelog),
	}
}

export async function fetchLatestAppRelease(
	signal?: AbortSignal,
): Promise<AppReleaseInfo> {
	const response = await fetch(`${API_BASE_URL}/app/version`, {
		cache: 'no-store',
		headers: {
			Accept: 'application/json',
		},
		signal,
	})

	if (!response.ok) {
		throw new Error(`Release endpoint returned HTTP ${response.status}`)
	}

	const data = await response.json()

	return {
		version: String(data.version ?? ''),
		build: Number.parseInt(String(data.build ?? '0'), 10),
		apk_url: String(data.apk_url ?? ''),
		changelog: String(data.changelog ?? ''),
	}
}
