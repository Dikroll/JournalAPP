import { Browser } from '@capacitor/browser'
import { useCallback, useState } from 'react'

interface VideoPlayerState {
	overlayUrl: string | null
	openVideo: (url: string) => Promise<void>
	closeOverlay: () => void
}

function isIOS(): boolean {
	if (typeof navigator === 'undefined') return false
	return /iPhone|iPad|iPod/.test(navigator.userAgent)
}

function isYouTube(url: string): boolean {
	return /youtube\.com|youtu\.be/.test(url)
}

function isVimeo(url: string): boolean {
	return /vimeo\.com/.test(url)
}

function isDirectVideoFile(url: string): boolean {
	return /\.(mp4|mov)(\?|$)/i.test(url)
}

function normalizeYouTubeUrl(url: string): string {
	if (url.includes('youtu.be')) {
		const id = url.split('/').pop()?.split('?')[0]
		return `https://www.youtube.com/watch?v=${id}`
	}

	if (url.includes('/embed/')) {
		const id = url.split('/embed/')[1]?.split('?')[0]
		return `https://www.youtube.com/watch?v=${id}`
	}

	return url
}

export function getEmbedUrl(url: string): string {
	if (isYouTube(url)) {
		let id = ''

		if (url.includes('youtu.be')) {
			id = url.split('/').pop()?.split('?')[0] || ''
		} else if (url.includes('watch?v=')) {
			id = url.split('watch?v=')[1]?.split('&')[0] || ''
		} else if (url.includes('/embed/')) {
			id = url.split('/embed/')[1]?.split('?')[0] || ''
		}

		if (!id) return url

		return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1`
	}

	if (isVimeo(url)) {
		const id = url.split('/').pop()?.split('?')[0]
		return `https://player.vimeo.com/video/${id}?autoplay=1`
	}

	return url
}
export function useVideoPlayer(): VideoPlayerState {
	const [overlayUrl, setOverlayUrl] = useState<string | null>(null)

	const openVideo = useCallback(async (url: string) => {
		const ios = isIOS()

		if (ios && (isYouTube(url) || isVimeo(url))) {
			const normalized = isYouTube(url) ? normalizeYouTubeUrl(url) : url

			await Browser.open({
				url: normalized,
			})

			return
		}
		if (isDirectVideoFile(url)) {
			setOverlayUrl(url)
			return
		}
		setOverlayUrl(url)
	}, [])

	const closeOverlay = useCallback(() => {
		setOverlayUrl(null)
	}, [])

	return {
		overlayUrl,
		openVideo,
		closeOverlay,
	}
}

export { isDirectVideoFile }
