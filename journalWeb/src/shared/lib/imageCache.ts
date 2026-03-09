const preloaded = new Set<string>()

export function preloadImages(urls: (string | null)[]) {
	urls.forEach(url => {
		if (!url || preloaded.has(url)) return
		preloaded.add(url)
		const img = new Image()
		img.src = url
	})
}

export function getCachedImageUrl(url: string): string {
	return url
}
