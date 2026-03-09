const FS_HOST = 'fs.top-academy.ru'

const resolved = new Map<string, string>()

export function getPhotoUrl(url: string | null | undefined): string | null {
	if (!url) return null

	const hit = resolved.get(url)
	if (hit !== undefined) return hit

	let result: string

	try {
		const parsed = new URL(url)

		if (parsed.host === FS_HOST) {
			const fileId = parsed.pathname.split('/').pop()
			result = fileId ? `/api/files/${fileId}` : url
		} else {
			result = parsed.origin + parsed.pathname
		}
	} catch {
		result = url
	}

	resolved.set(url, result)
	return result
}
