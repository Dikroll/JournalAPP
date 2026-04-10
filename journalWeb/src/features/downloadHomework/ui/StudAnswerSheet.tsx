import { timing } from '@/shared/config'
import { CatGame } from '@/shared/ui/CatGame'
import { IconButton } from '@/shared/ui'
import { MessageSquare, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
	answer: string
	homeworkTheme: string
	onClose: () => void
}

export function StudAnswerSheet({ answer, homeworkTheme, onClose }: Props) {
	const [visible, setVisible] = useState(false)
	const [dragY, setDragY] = useState(0)
	const [dragging, setDragging] = useState(false)
	const dragStartY = useRef(0)
	const sheetRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		requestAnimationFrame(() => setVisible(true))
	}, [])

	const handleClose = () => {
		setVisible(false)
		setDragY(0)
		setTimeout(onClose, timing.SHEET_CLOSE_ANIMATION)
	}

	useEffect(() => {
		const fn = (e: KeyboardEvent) => {
			if (e.key === 'Escape') handleClose()
		}
		document.addEventListener('keydown', fn)
		return () => document.removeEventListener('keydown', fn)
	}, [])

	useEffect(() => {
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [])

	const onTouchStart = (e: React.TouchEvent) => {
		dragStartY.current = e.touches[0].clientY
		setDragging(true)
	}
	const onTouchMove = (e: React.TouchEvent) => {
		const d = e.touches[0].clientY - dragStartY.current
		if (d > 0) setDragY(d)
	}
	const onTouchEnd = () => {
		setDragging(false)
		if (dragY > 100) handleClose()
		else setDragY(0)
	}
	const onMouseDown = (e: React.MouseEvent) => {
		dragStartY.current = e.clientY
		setDragging(true)
		const move = (ev: MouseEvent) => {
			const d = ev.clientY - dragStartY.current
			if (d > 0) setDragY(d)
		}
		const up = (ev: MouseEvent) => {
			setDragging(false)
			if (ev.clientY - dragStartY.current > 100) handleClose()
			else setDragY(0)
			window.removeEventListener('mousemove', move)
			window.removeEventListener('mouseup', up)
		}
		window.addEventListener('mousemove', move)
		window.addEventListener('mouseup', up)
	}

	const overlayOpacity = visible ? Math.max(0, 0.6 - dragY / 400) : 0

	return createPortal(
		<div
			className='fixed inset-0 z-50 flex items-end justify-center'
			style={{
				transition: dragging ? 'none' : 'background 0.3s ease',
				background: `rgba(0,0,0,${overlayOpacity})`,
			}}
			onClick={handleClose}
		>
			<div
				ref={sheetRef}
				onClick={e => e.stopPropagation()}
				style={{
					transition: dragging
						? 'none'
						: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
					transform: visible ? `translateY(${dragY}px)` : 'translateY(100%)',
					background: 'var(--color-modal-bg)',
				}}
				className='w-full max-w-lg border-t border-x border-app-border rounded-t-3xl shadow-2xl flex flex-col overflow-hidden'
			>
				{/* Drag handle */}
				<div
					className='flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing'
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
					onMouseDown={onMouseDown}
				>
					<div className='w-10 h-1 rounded-full bg-glass-strong' />
				</div>

				{/* Header */}
				<div className='flex items-center justify-between px-4 pt-1 pb-3 flex-shrink-0'>
					<div className='flex items-center gap-2.5'>
						<div className='w-9 h-9 rounded-2xl bg-glass border border-glass-border flex items-center justify-center'>
							<MessageSquare size={16} className='text-app-muted' />
						</div>
						<div>
							<p className='text-xs text-app-muted leading-none mb-1'>
								Мой ответ
							</p>
							<p className='text-sm font-semibold text-app-text leading-none line-clamp-1'>
								{homeworkTheme}
							</p>
						</div>
					</div>
					<IconButton
						icon={<X size={15} />}
						onClick={handleClose}
						shape='square'
						aria-label='Закрыть'
					/>
				</div>

				{/* Answer — scrollable, max ~5 lines visible */}
				<div
					className='mx-4 mb-3 rounded-2xl bg-glass border border-glass-border px-4 py-3 flex-shrink-0 overflow-y-auto'
					style={{ maxHeight: '9rem' }}
				>
					<p className='text-sm text-app-text leading-relaxed whitespace-pre-wrap break-words'>
						{answer}
					</p>
				</div>

				{/* Label */}
				<div className='flex items-center gap-3 px-4 mb-2 flex-shrink-0'>
					<div className='h-px flex-1 bg-glass-border' />
					<p className='text-[10px] text-app-muted tracking-widest uppercase select-none'>
						пока ждёшь оценку...
					</p>
					<div className='h-px flex-1 bg-glass-border' />
				</div>

				{/* Game — fixed comfortable height */}
				<div className='px-3 pb-4 flex-shrink-0' style={{ height: '240px' }}>
					<div className='w-full h-full rounded-2xl overflow-hidden'>
						<CatGame />
					</div>
				</div>
			</div>
		</div>,
		document.body,
	)
}
