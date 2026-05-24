import type { Totals } from '@/features/goalForecast'

interface Props {
	data: Totals
}

export function CountStat({ data }: Props) {
	return (
		<div
			className='rounded-[20px] p-4'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='text-[12px] uppercase tracking-wider text-app-muted'>
				оценок
			</div>
			<div className='text-[24px] font-semibold mt-1.5 text-app-text tabular-nums'>
				{data.withMarks}
				<span className='text-[14px] font-normal text-app-muted'>
					/{data.lessons}
				</span>
			</div>
			<div className='text-[12px] text-app-muted mt-1'>
				пар всего {data.lessons}
			</div>
		</div>
	)
}
