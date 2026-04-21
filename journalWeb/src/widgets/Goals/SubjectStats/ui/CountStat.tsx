import type { Totals } from '@/features/goalForecast'

interface Props {
	data: Totals
}

export function CountStat({ data }: Props) {
	return (
		<div
			className='rounded-[20px] p-3'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
			}}
		>
			<div className='text-[10px] uppercase tracking-wider text-app-muted'>
				оценок
			</div>
			<div className='text-[22px] font-semibold mt-1 text-app-text'>
				{data.withMarks}
				<span className='text-[13px] font-normal text-app-muted'>
					/{data.lessons}
				</span>
			</div>
			<div className='text-[10px] text-app-muted mt-0.5'>
				пар всего {data.lessons}
			</div>
		</div>
	)
}
