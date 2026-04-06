import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getEmbedUrl, isDirectVideoFile } from '../hooks/useVideoPlayer'
interface Props {
	url: string
	title?: string
	onClose: () => void
}

export function VideoPlayerOverlay({ url, title, onClose }: Props) {
	useEffect(() => {
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [])

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [onClose])

	const content = isDirectVideoFile(url) ? (
		<video
			src={url}
			controls
			autoPlay
			muted
			playsInline
			className='w-full'
			style={{ maxHeight: '75vh', background: '#000' }}
		/>
	) : (
		<div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
			<iframe
				src={getEmbedUrl(url)}
				title={title ?? 'Видео'}
				allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
				allowFullScreen
				className='absolute inset-0 w-full h-full'
				style={{ border: 'none' }}
			/>
		</div>
	)

	return createPortal(
		<div
			className='fixed inset-0 z-[100] flex items-center justify-center'
			style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}
			onClick={onClose}
		>
			<button
				type='button'
				onClick={onClose}
				className='absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center'
				style={{
					background: 'rgba(255,255,255,0.1)',
					border: '1px solid rgba(255,255,255,0.2)',
				}}
			>
				<X size={20} className='text-white' />
			</button>

			<div
				className='w-full max-w-2xl mx-4 rounded-2xl overflow-hidden'
				style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
				onClick={e => e.stopPropagation()}
			>
				{content}
			</div>
		</div>,
		document.body,
	)
}
