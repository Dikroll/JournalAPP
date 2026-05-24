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
						className='relative flex-1 h-10 rounded-xl text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1.5'
						style={{
							WebkitTapHighlightColor: 'transparent',
							background: isActive ? 'var(--color-surface)' : 'transparent',
							border: isActive
								? '1px solid var(--color-border)'
								: '1px solid var(--color-border)',
							color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
							boxShadow: 'none',
						}}
					>
						{icon}
						{label}
						{badge != null && badge > 0 && (
							<span className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center'>
								{badge}
							</span>
						)}
					</button>
				)
			})}
		</div>
	)
}
