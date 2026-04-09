import type { LibraryMaterial } from '@/entities/library'
import { useVideoPlayer, VideoPlayerOverlay } from '@/features/playVideo'
import {
	getCachedImageUrl,
	getYouTubeThumbnail,
	toYouTubeEmbed,
} from '@/shared/lib'
import { PhotoViewerModal } from '@/shared/ui'
import {
	BookMarked,
	BookOpen,
	FileText,
	FlaskConical,
	Play,
	Presentation,
	TestTube,
	Video,
} from 'lucide-react'
import { memo, useState } from 'react'
import { createPortal } from 'react-dom'

const TYPE_PLACEHOLDER_ICONS: Record<number, React.ReactNode> = {
	1: <BookOpen size={28} />,
	2: <FileText size={28} />,
	3: <FlaskConical size={28} />,
	4: <BookMarked size={28} />,
	5: <Video size={28} />,
	6: <Presentation size={28} />,
	7: <TestTube size={28} />,
	8: <FileText size={28} />,
}

const TYPE_PLACEHOLDER_ICONS_LG: Record<number, React.ReactNode> = {
	1: <BookOpen size={96} />,
	2: <FileText size={96} />,
	3: <FlaskConical size={96} />,
	4: <BookMarked size={96} />,
	5: <Video size={96} />,
	6: <Presentation size={96} />,
	7: <TestTube size={96} />,
	8: <FileText size={96} />,
}

// ── YouTube превью ─────────────────────────────────────────────
// Thumbnail грузится как обычная картинка — ноль запросов к Google.
// При клике: нативный плеер на Capacitor, оверлей на вебе.

interface YoutubePreviewProps {
	thumbnailUrl: string | null
	watchUrl: string // оригинальный URL для нативного плеера
	title: string
	typeColor: { border: string; bg: string; text: string }
}

function YoutubePreview({
	thumbnailUrl,
	watchUrl,
	title,
	typeColor,
}: YoutubePreviewProps) {
	const [thumbErr, setThumbErr] = useState(false)
	const { overlayUrl, openVideo, closeOverlay } = useVideoPlayer()

	// Нативный плеер получает оригинальный watchUrl,
	// веб-оверлей открывается с embedUrl (autoplay=1 добавляет сам оверлей)
	const handleClick = () => {
		openVideo(watchUrl)
		// При fallback на веб useVideoPlayer запишет watchUrl в overlayUrl,
		// но VideoPlayerOverlay умеет конвертировать watch?v= → embed сам через getEmbedUrl
	}

	const previewHeight = { aspectRatio: '16/9' } as React.CSSProperties

	if (thumbnailUrl && !thumbErr) {
		return (
			<>
				<button
					type='button'
					onClick={handleClick}
					className='relative w-full overflow-hidden block focus:outline-none group'
					style={previewHeight}
				>
					<img
						src={thumbnailUrl}
						alt={title}
						className='w-full h-full object-cover'
						loading='lazy'
						onError={() => setThumbErr(true)}
					/>
					<div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors'>
						<div
							className='w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110'
							style={{
								background: 'rgba(255,0,0,0.9)',
								boxShadow: '0 4px 24px rgba(255,0,0,0.5)',
							}}
						>
							<Play
								size={28}
								className='text-white'
								style={{ marginLeft: 3 }}
							/>
						</div>
					</div>
				</button>

				{overlayUrl && (
					<VideoPlayerOverlay
						url={overlayUrl}
						title={title}
						onClose={closeOverlay}
					/>
				)}
			</>
		)
	}

	// Fallback без thumbnail
	return (
		<>
			<button
				type='button'
				onClick={handleClick}
				className='relative w-full flex items-center justify-center focus:outline-none group'
				style={{
					...previewHeight,
					background: `linear-gradient(135deg, ${typeColor.bg} 0%, var(--color-surface-strong) 100%)`,
					borderBottom: `1px solid ${typeColor.border}`,
				}}
			>
				<div
					className='w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110'
					style={{
						background: 'rgba(255,0,0,0.85)',
						boxShadow: '0 4px 20px rgba(255,0,0,0.35)',
					}}
				>
					<Play size={26} className='text-white' style={{ marginLeft: 3 }} />
				</div>
			</button>

			{overlayUrl && (
				<VideoPlayerOverlay
					url={overlayUrl}
					title={title}
					onClose={closeOverlay}
				/>
			)}
		</>
	)
}

// ── Главный компонент ──────────────────────────────────────────

interface Props {
	material: LibraryMaterial
	typeColor: { border: string; bg: string; text: string }
}

export const MaterialCover = memo(function MaterialCover({
	material,
	typeColor,
}: Props) {
	const [viewerOpen, setViewerOpen] = useState(false)
	const [imgError, setImgError] = useState(false)
	const { overlayUrl, openVideo, closeOverlay } = useVideoPlayer()

	const photoUrl = getCachedImageUrl(material.cover_image)
	const isVideo = material.material_type === 5

	const youtubeEmbed =
		isVideo && material.url ? toYouTubeEmbed(material.url) : null
	const youtubeThumbnail =
		isVideo && material.url ? getYouTubeThumbnail(material.url) : null
	const isExternalVideo = isVideo && !!material.url && !youtubeEmbed

	// ── 1. YouTube ──────────────────────────────────────────────
	if (youtubeEmbed) {
		return (
			<YoutubePreview
				thumbnailUrl={youtubeThumbnail}
				watchUrl={material.url!}
				title={material.theme}
				typeColor={typeColor}
			/>
		)
	}

	// ── 2. Внешнее видео + обложка ──────────────────────────────
	if (isExternalVideo && photoUrl && !imgError) {
		return (
			<>
				<button
					type='button'
					onClick={() => openVideo(material.url!)}
					className='relative w-full overflow-hidden block focus:outline-none group'
					style={{ aspectRatio: '16/9' }}
				>
					<img
						src={photoUrl}
						alt={material.theme}
						className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
						onError={() => setImgError(true)}
					/>
					<div className='absolute inset-0 flex items-center justify-center bg-black/25'>
						<div
							className='w-12 h-12 rounded-full flex items-center justify-center'
							style={{
								background: 'rgba(0,0,0,0.55)',
								backdropFilter: 'blur(4px)',
								border: '1.5px solid rgba(255,255,255,0.3)',
							}}
						>
							<Play
								size={22}
								className='text-white'
								style={{ marginLeft: 2 }}
							/>
						</div>
					</div>
				</button>

				{overlayUrl && (
					<VideoPlayerOverlay
						url={overlayUrl}
						title={material.theme}
						onClose={closeOverlay}
					/>
				)}
			</>
		)
	}

	// ── 3. Внешнее видео без обложки ────────────────────────────
	if (isExternalVideo) {
		return (
			<>
				<button
					type='button'
					onClick={() => openVideo(material.url!)}
					className='w-full flex flex-col items-center justify-center gap-2.5 focus:outline-none'
					style={{
						height: 148,
						background: typeColor.bg,
						borderBottom: `1px solid ${typeColor.border}`,
					}}
				>
					<div
						className='w-12 h-12 rounded-full flex items-center justify-center'
						style={{
							background: 'rgba(255,255,255,0.08)',
							border: `1.5px solid ${typeColor.border}`,
						}}
					>
						<Play size={22} style={{ color: typeColor.text, marginLeft: 2 }} />
					</div>
					<span
						className='text-xs font-medium'
						style={{ color: typeColor.text }}
					>
						Смотреть видео
					</span>
				</button>

				{overlayUrl && (
					<VideoPlayerOverlay
						url={overlayUrl}
						title={material.theme}
						onClose={closeOverlay}
					/>
				)}
			</>
		)
	}

	// ── 4. Обычная обложка ──────────────────────────────────────
	if (photoUrl && !imgError) {
		return (
			<>
				<button
					type='button'
					onClick={() => setViewerOpen(true)}
					className='w-full overflow-hidden block focus:outline-none'
					style={{ height: 160 }}
				>
					<img
						src={photoUrl}
						alt={material.theme}
						className='w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]'
						onError={() => setImgError(true)}
					/>
				</button>

				{viewerOpen &&
					createPortal(
						<PhotoViewerModal
							src={photoUrl}
							alt={material.theme}
							onClose={() => setViewerOpen(false)}
						/>,
						document.body,
					)}
			</>
		)
	}

	// ── 5. Заглушка ─────────────────────────────────────────────
	return (
		<div
			className='w-full flex items-center justify-center relative overflow-hidden'
			style={{
				height: 120,
				background: `linear-gradient(135deg, ${typeColor.bg} 0%, var(--color-surface-strong) 100%)`,
				borderBottom: `1px solid ${typeColor.border}`,
			}}
		>
			{/* Декоративная иконка на фоне */}
			<span
				className='absolute opacity-[0.07]'
				style={{ color: typeColor.text, right: -8, bottom: -8 }}
			>
				{TYPE_PLACEHOLDER_ICONS_LG[material.material_type] ?? (
					<FileText size={96} />
				)}
			</span>

			{/* Основная иконка */}
			<div
				className='w-12 h-12 rounded-2xl flex items-center justify-center'
				style={{
					background: 'rgba(255,255,255,0.06)',
					border: `1.5px solid ${typeColor.border}`,
				}}
			>
				<span style={{ color: typeColor.text }}>
					{TYPE_PLACEHOLDER_ICONS[material.material_type] ?? (
						<FileText size={28} />
					)}
				</span>
			</div>
		</div>
	)
})
