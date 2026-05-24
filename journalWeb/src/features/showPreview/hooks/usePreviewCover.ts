import type { LibraryMaterial } from '@/entities/library'
import { getCachedImageUrl } from '@/shared/lib'
import { useCallback, useEffect, useRef, useState } from 'react'

function toYouTubeEmbed(url: string): string | null {
	if (url.includes('youtube.com/embed/')) return url
	if (url.includes('youtu.be/')) {
		const id = url.split('youtu.be/')[1]?.split('?')[0]
		return id ? `https://www.youtube.com/embed/${id}` : null
	}
	const match = url.match(/[?&]v=([^&]+)/)
	if (match) return `https://www.youtube.com/embed/${match[1]}`
	return null
}

export function usePreviewCover(material: LibraryMaterial) {
	const [viewerOpen, setViewerOpen] = useState(false)
	const [photoUrl, setPhotoUrl] = useState<string | null>(null)
	const [youtubeEmbed, setYoutubeEmbed] = useState<string | null>(null)

	const isVideo = material.material_type === 5
	const hasCoverImage = material.cover_image !== null
	const cachedVideoUrl = useRef<string | null>(null)

	useEffect(() => {
		if (!viewerOpen || !isVideo || !material.url) {
			setYoutubeEmbed(null)
			return
		}

		if (cachedVideoUrl.current === material.url) return

		cachedVideoUrl.current = material.url
		const embed = toYouTubeEmbed(material.url)
		setYoutubeEmbed(embed)
	}, [viewerOpen, isVideo, material.url])

	useEffect(() => {
		if (!viewerOpen || !material.cover_image) {
			setPhotoUrl(null)
			return
		}

		const url = getCachedImageUrl(material.cover_image)
		setPhotoUrl(url)
	}, [viewerOpen, material.cover_image])

	const setViewerOpenCallback = useCallback(setViewerOpen, [])
	const isExternalVideo = isVideo && material.url && !youtubeEmbed

	return {
		viewerOpen,
		setViewerOpen: setViewerOpenCallback,
		photoUrl,
		youtubeEmbed,
		isExternalVideo,
		isVideo,
		hasCoverImage,
	}
}
