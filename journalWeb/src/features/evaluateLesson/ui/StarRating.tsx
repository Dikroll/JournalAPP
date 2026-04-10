import { Star } from 'lucide-react'

interface Props {
	value: number
	onChange: (v: number) => void
	size?: number
}

export function StarRating({ value, onChange, size = 28 }: Props) {
	return (
		<div className='flex gap-1'>
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
		</div>
	)
}
