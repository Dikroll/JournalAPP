import type { PeriodItem } from '@/features/goalForecast'
import { gradeColor } from '@/shared/config'

interface Props {
	data: PeriodItem[]
}

export function ByPeriodStat({ data }: Props) {
	if (data.length === 0) return null
	return (
		<div
			className='rounded-[20px] p-4'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='text-[12px] uppercase tracking-wider text-app-muted mb-2.5'>
				по неделям
			</div>
			<div className='flex items-end gap-1.5' style={{ height: 56 }}>
				{data.map(item => (
					<div
						key={item.label}
						className='flex-1 rounded'
						style={{
							height: `${(item.avg / 5) * 100}%`,
							minHeight: 4,
							background: gradeColor(item.avg),
						}}
						title={`${item.label}: ${item.avg.toFixed(1)}`}
					/>
				))}
			</div>
			<div className='flex justify-between text-[11px] text-app-muted mt-2'>
				<span>{data[0]?.label}</span>
				<span>{data[data.length - 1]?.label}</span>
			</div>
		</div>
	)
}
