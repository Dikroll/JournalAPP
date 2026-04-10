import { Star } from 'lucide-react'

const LABELS: Record<number, string> = {
	1: 'Бесполезно',
	2: 'Сомнительно',
	3: 'Пойдет',
	4: 'Полезно',
	5: 'Круто',
}

export function StarRating({
	value,
	onChange,
}: {
	value: number
	onChange: (v: number) => void
}) {
	return (
		<div>
			<p className='text-xs text-app-muted mb-2.5'>Полезность задания</p>
			<div className='flex items-center gap-2'>
				{[1, 2, 3, 4, 5].map(n => (
					<button
						key={n}
						type='button'
						onClick={() => onChange(n)}
						className='transition-transform active:scale-90'
					>
						<Star
							size={26}
							className='transition-colors'
							style={{
								color: n <= value ? '#FBBF24' : 'var(--color-border)',
								fill: n <= value ? '#FBBF24' : 'transparent',
							}}
						/>
					</button>
				))}
				{value > 0 && (
					<span className='ml-1 text-xs text-app-muted'>{LABELS[value]}</span>
				)}
			</div>
		</div>
	)
}
