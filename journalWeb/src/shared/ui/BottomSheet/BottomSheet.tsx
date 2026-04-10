import { type ReactNode, useEffect } from 'react'

interface BottomSheetProps {
	children: ReactNode
	onBackdropClick?: () => void
	zIndex?: number
	maxWidth?: string
}

/**
 * Base bottom sheet wrapper: dark overlay + rounded container + drag handle + padding.
 * Children render below the drag handle inside a padded container.
 */
export function BottomSheet({
	children,
	onBackdropClick,
	zIndex = 200,
	maxWidth,
}: BottomSheetProps) {
	useEffect(() => {
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [])

	return (
		<div
			className='fixed inset-0 flex items-end justify-center'
			style={{ background: 'var(--color-modal-backdrop)', backdropFilter: 'blur(4px)', zIndex }}
			onClick={onBackdropClick}
		>
			<div
				className={`w-full ${maxWidth ?? ''} rounded-t-[28px] p-5 border-t border-x border-app-border`}
				style={{ background: 'var(--color-modal-bg)' }}
				onClick={e => e.stopPropagation()}
			>
				<div className='w-10 h-1 bg-glass-strong rounded-full mx-auto mb-4' />
				{children}
			</div>
		</div>
	)
}
