import { Star } from 'lucide-react'

interface Props {
	value: number
	onChange: (v: number) => void
	size?: number
	title?: string
	labels?: Record<number, string>
}

export function StarRating({ value, onChange, size = 28, title, labels }: Props) {
	return (
		<div>
			{title && <p className='text-xs text-app-muted mb-2.5'>{title}</p>}
			<div className='flex items-center gap-2'>
				{[1, 2, 3, 4, 5].map(n => (
					<button
						key={n}
						type='button'
						onClick={() => onChange(n)}
						className='transition-transform active:scale-90'
						style={{ WebkitTapHighlightColor: 'transparent' }}
					>
						<Star
							size={size}
							className='transition-colors'
							style={{
								color: n <= value ? '#FBBF24' : 'var(--color-border)',
								fill: n <= value ? '#FBBF24' : 'transparent',
							}}
						/>
					</button>
				))}
				{labels && value > 0 && (
					<span className='ml-1 text-xs text-app-muted'>{labels[value]}</span>
				)}
			</div>
		</div>
	)
}
