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
	items: ChangelogItem[]
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

export interface ChangelogItem {
	label: string | null
	text: string
}

const CHANGELOG_LABEL_RE = /^(fix|add|change|remove|update|feat|refactor|improve):\s*/i

export function parseChangelogItems(changelog: string): ChangelogItem[] {
	const items = changelog
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => line.replace(/^[-*•]\s*/, ''))
		.map(line => {
			const match = line.match(CHANGELOG_LABEL_RE)
			if (match) {
				return { label: match[1].toLowerCase(), text: line.slice(match[0].length) }
			}
			return { label: null, text: line }
		})

	if (items.length === 0) {
		return [{ label: null, text: 'Описание обновления скоро появится' }]
	}

	return items
}

export function getChangelogLabelStyle(label: string): string {
	switch (label) {
		case 'fix':
			return 'bg-[#EF4444]/15 text-[#F87171]'
		case 'add':
		case 'feat':
			return 'bg-[#22C55E]/15 text-[#4ADE80]'
		case 'change':
		case 'update':
		case 'improve':
			return 'bg-[#3B82F6]/15 text-[#60A5FA]'
		case 'remove':
			return 'bg-[#F59E0B]/15 text-[#FBBF24]'
		case 'refactor':
			return 'bg-[#8B5CF6]/15 text-[#A78BFA]'
		default:
			return 'bg-white/10 text-[#9CA3AF]'
	}
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
