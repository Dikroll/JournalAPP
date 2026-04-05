import type { LibraryMaterial } from '@/entities/library'
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

// ── placeholder-иконки по типу ─────────────────────────────────

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

// ── YouTube фасад: загружает только thumbnail, iframe при клике ──
// Это предотвращает загрузку Google-скриптов и youtube.com/log_event запросы

interface YoutubeFacadeProps {
	thumbnailUrl: string | null
	embedUrl: string
	title: string
	typeColor: { border: string; bg: string; text: string }
}

function YoutubeFacade({
	thumbnailUrl,
	embedUrl,
	title,
	typeColor,
}: YoutubeFacadeProps) {
	const [active, setActive] = useState(false)

	// Iframe монтируется только после клика
	if (active) {
		return (
			<div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
				<iframe
					src={`${embedUrl}?autoplay=1`}
					title={title}
					allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
					allowFullScreen
					className='absolute inset-0 w-full h-full'
					style={{ border: 'none' }}
				/>
			</div>
		)
	}

	// До клика показываем thumbnail как обычную картинку
	// Это не инициирует YouTube скрипты или log_event
	if (thumbnailUrl) {
		return (
			<button
				type='button'
				onClick={() => setActive(true)}
				className='relative w-full overflow-hidden block focus:outline-none group'
				style={{ height: 160 }}
			>
				<img
					src={thumbnailUrl}
					alt={title}
					className='w-full h-full object-cover'
					loading='lazy'
				/>
				<div className='absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors'>
					<div
						className='w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110'
						style={{
							background: 'rgba(255,0,0,0.85)',
							boxShadow: '0 4px 20px rgba(255,0,0,0.35)',
						}}
					>
						<Play size={28} className='text-white' style={{ marginLeft: 3 }} />
					</div>
				</div>
			</button>
		)
	}

	// Fallback на кнопку если нет thumbnail
	return (
		<button
			type='button'
			onClick={() => setActive(true)}
			className='relative w-full flex items-center justify-center focus:outline-none group'
			style={{
				aspectRatio: '16/9',
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
				<Play size={24} className='text-white' style={{ marginLeft: 3 }} />
			</div>
		</button>
	)
}

interface Props {
	material: LibraryMaterial
	typeColor: { border: string; bg: string; text: string }
	onOpenExternal?: () => void
}

export const MaterialCover = memo(function MaterialCover({
	material,
	typeColor,
	onOpenExternal,
}: Props) {
	const [viewerOpen, setViewerOpen] = useState(false)
	const [imgError, setImgError] = useState(false)

	const photoUrl = getCachedImageUrl(material.cover_image)
	const isVideo = material.material_type === 5

	const youtubeEmbed =
		isVideo && material.url ? toYouTubeEmbed(material.url) : null
	const youtubeThumbnail =
		isVideo && material.url ? getYouTubeThumbnail(material.url) : null

	const isExternalVideo = isVideo && !!material.url && !youtubeEmbed

	// YouTube видео - показываем thumbnail до клика, iframe после
	if (youtubeEmbed) {
		return (
			<YoutubeFacade
				thumbnailUrl={youtubeThumbnail}
				embedUrl={youtubeEmbed}
				title={material.theme}
				typeColor={typeColor}
			/>
		)
	}

	if (isExternalVideo && photoUrl && !imgError) {
		return (
			<button
				type='button'
				onClick={onOpenExternal}
				className='relative w-full overflow-hidden block focus:outline-none group'
				style={{ height: 160 }}
			>
				<img
					src={photoUrl}
					alt={material.theme}
					className='absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
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
						<Play size={22} className='text-white' style={{ marginLeft: 2 }} />
					</div>
				</div>
			</button>
		)
	}

	if (isExternalVideo) {
		return (
			<button
				type='button'
				onClick={onOpenExternal}
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
				<span className='text-xs font-medium' style={{ color: typeColor.text }}>
					Смотреть видео
				</span>
			</button>
		)
	}

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

	return (
		<div
			className='w-full flex items-center justify-center'
			style={{
				height: 88,
				background: typeColor.bg,
				borderBottom: `1px solid ${typeColor.border}`,
				opacity: 0.6,
			}}
		>
			<span style={{ color: typeColor.text }}>
				{TYPE_PLACEHOLDER_ICONS[material.material_type] ?? (
					<FileText size={28} />
				)}
			</span>
		</div>
	)
})
