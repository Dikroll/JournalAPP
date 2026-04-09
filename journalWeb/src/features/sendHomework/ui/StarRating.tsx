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
			<p className='text-xs text-[#9CA3AF] mb-2.5'>Полезность задания</p>
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
							className={
								n <= value
									? 'text-[#3B82F6] fill-[#3B82F6]'
									: 'text-white/15 fill-transparent'
							}
						/>
					</button>
				))}
				{value > 0 && (
					<span className='ml-1 text-xs text-[#9CA3AF]'>{LABELS[value]}</span>
				)}
			</div>
		</div>
	)
}
