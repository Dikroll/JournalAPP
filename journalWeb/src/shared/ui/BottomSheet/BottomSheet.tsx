import type { ReactNode } from 'react'

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
	return (
		<div
			className='fixed inset-0 flex items-end justify-center'
			style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex }}
			onClick={onBackdropClick}
		>
			<div
				className={`w-full ${maxWidth ?? ''} rounded-t-[28px] p-5`}
				style={{
					background: '#1A1C21',
					border: '1px solid rgba(255,255,255,0.08)',
				}}
				onClick={e => e.stopPropagation()}
			>
				<div className='w-10 h-1 bg-white/20 rounded-full mx-auto mb-4' />
				{children}
			</div>
		</div>
	)
}
