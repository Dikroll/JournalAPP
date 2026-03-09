const CACHE_NAME = 'avatars-v1'

const primed = new Set<string>()

export async function getAvatarUrl(url: string): Promise<string> {
	if (!url) return ''
	if (primed.has(url)) return url

	try {
		const cache = await caches.open(CACHE_NAME)
		const hit = await cache.match(url)

		if (!hit) {
			await cache.add(url).catch(() => {})
		}

		primed.add(url)
	} catch {}

	return url
}

export async function clearAvatarCache(): Promise<void> {
	primed.clear()
	try {
		await caches.delete(CACHE_NAME)
	} catch {}
}
