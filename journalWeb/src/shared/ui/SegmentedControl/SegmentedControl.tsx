import type { ReactNode } from 'react'

export interface Segment<T extends string> {
	key: T
	label: string
	icon?: ReactNode
	badge?: number
}

interface Props<T extends string> {
	segments: Segment<T>[]
	active: T
	onChange: (key: T) => void
}

export function SegmentedControl<T extends string>({
	segments,
	active,
	onChange,
}: Props<T>) {
	return (
		<div className='flex gap-2'>
			{segments.map(({ key, label, icon, badge }) => {
				const isActive = active === key
				return (
					<button
						key={key}
						type='button'
						onClick={() => onChange(key)}
						className='relative flex-1 h-10 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-1.5'
						style={{
							WebkitTapHighlightColor: 'transparent',
							background: isActive
								? 'var(--color-surface-strong)'
								: 'var(--color-surface)',
							border: isActive
								? '1.5px solid var(--color-border-strong)'
								: '1px solid var(--color-border)',
							color: isActive
								? 'var(--color-text)'
								: 'var(--color-text-muted)',
							boxShadow: isActive ? 'var(--shadow-card)' : 'none',
						}}
					>
						{icon}
						{label}
						{badge != null && badge > 0 && (
							<span className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center'>
								{badge}
							</span>
						)}
					</button>
				)
			})}
		</div>
	)
}
