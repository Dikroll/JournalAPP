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
		setTimeout(onClose, 300)
	}

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [])

	useEffect(() => {
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [])

	// Touch drag
	const onTouchStart = (e: React.TouchEvent) => {
		dragStartY.current = e.touches[0].clientY
		setDragging(true)
	}
	const onTouchMove = (e: React.TouchEvent) => {
		const delta = e.touches[0].clientY - dragStartY.current
		if (delta > 0) setDragY(delta)
	}
	const onTouchEnd = () => {
		setDragging(false)
		if (dragY > 100) handleClose()
		else setDragY(0)
	}

	// Mouse drag
	const onMouseDown = (e: React.MouseEvent) => {
		dragStartY.current = e.clientY
		setDragging(true)

		const onMouseMove = (ev: MouseEvent) => {
			const delta = ev.clientY - dragStartY.current
			if (delta > 0) setDragY(delta)
		}
		const onMouseUp = (ev: MouseEvent) => {
			const delta = ev.clientY - dragStartY.current
			setDragging(false)
			if (delta > 100) handleClose()
			else setDragY(0)
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
		}
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
	}

	const overlayOpacity = visible ? Math.max(0, 0.55 - dragY / 400) : 0

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
						: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
					transform: visible ? `translateY(${dragY}px)` : 'translateY(100%)',
					height: '65vh',
				}}
				className='w-full max-w-lg bg-[#1C1C1E] border-t border-x border-white/10 rounded-t-3xl shadow-2xl flex flex-col'
			>
				{/* Drag handle — draggable zone */}
				<div
					className='flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing flex-shrink-0'
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
					onMouseDown={onMouseDown}
				>
					<div className='w-10 h-1 rounded-full bg-white/25' />
				</div>

				{/* Header */}
				<div className='flex items-center justify-between px-5 pb-4 flex-shrink-0'>
					<div className='flex items-center gap-2.5'>
						<div className='w-9 h-9 rounded-2xl bg-white/8 flex items-center justify-center'>
							<MessageSquare size={16} className='text-[#9CA3AF]' />
						</div>
						<div>
							<p className='text-xs text-[#6B7280] leading-none mb-1'>
								Мой ответ
							</p>
							<p className='text-sm font-semibold text-[#F2F2F2] leading-none line-clamp-1'>
								{homeworkTheme}
							</p>
						</div>
					</div>
					<button
						type='button'
						onClick={handleClose}
						className='w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#6B7280] hover:text-[#F2F2F2] transition-colors'
					>
						<X size={15} />
					</button>
				</div>

				{/* Divider */}
				<div className='mx-5 h-px bg-white/8 flex-shrink-0' />

				{/* Scrollable content */}
				<div className='flex-1 overflow-y-auto px-5 py-5'>
					<p className='text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap break-words'>
						{answer}
					</p>
				</div>
			</div>
		</div>,
		document.body,
	)
}
