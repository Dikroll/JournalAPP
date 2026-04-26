import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

interface BottomSheetProps {
	children: ReactNode
	onBackdropClick?: () => void
	zIndex?: number
	maxWidth?: string
}

export function BottomSheet({
	children,
	onBackdropClick,
	zIndex = 200,
	maxWidth,
}: BottomSheetProps) {
	const [dragY, setDragY] = useState(0)
	const [dragging, setDragging] = useState(false)
	const dragStart = useRef(0)
	const sheetRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const scrollY = window.scrollY
		const { body } = document
		body.style.position = 'fixed'
		body.style.top = `-${scrollY}px`
		body.style.left = '0'
		body.style.right = '0'
		body.style.overflow = 'hidden'
		return () => {
			body.style.position = ''
			body.style.top = ''
			body.style.left = ''
			body.style.right = ''
			body.style.overflow = ''
			window.scrollTo(0, scrollY)
		}
	}, [])

	const dismiss = useCallback(() => {
		onBackdropClick?.()
	}, [onBackdropClick])

	const onTouchStart = useCallback((e: React.TouchEvent) => {
		const sheet = sheetRef.current
		if (!sheet) return
		const rect = sheet.getBoundingClientRect()
		const touchY = e.touches[0].clientY
		if (touchY - rect.top > 40) return
		dragStart.current = touchY
		setDragging(true)
	}, [])

	const onTouchMove = useCallback((e: React.TouchEvent) => {
		if (!dragging) return
		const d = e.touches[0].clientY - dragStart.current
		if (d > 0) setDragY(d)
	}, [dragging])

	const onTouchEnd = useCallback(() => {
		if (!dragging) return
		setDragging(false)
		if (dragY > 80) {
			dismiss()
		}
		setDragY(0)
	}, [dragging, dragY, dismiss])

	return (
		<div
			className='fixed inset-0 flex items-end justify-center'
			style={{
				background: 'var(--color-modal-backdrop)',
				backdropFilter: 'blur(4px)',
				zIndex,
			}}
			onClick={onBackdropClick}
		>
			<div
				ref={sheetRef}
				className={`w-full ${maxWidth ?? ''} rounded-t-[28px] p-5 border-t border-x border-app-border`}
				style={{
					background: 'var(--color-modal-bg)',
					transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
					transition: dragging ? 'none' : 'transform 0.2s ease-out',
				}}
				onClick={e => e.stopPropagation()}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				<div className='w-10 h-1 bg-glass-strong rounded-full mx-auto mb-4 cursor-grab' />
				{children}
			</div>
		</div>
	)
}
