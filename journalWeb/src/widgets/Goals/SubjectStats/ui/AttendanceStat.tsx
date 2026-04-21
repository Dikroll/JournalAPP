import type { Attendance } from '@/features/goalForecast'

interface Props {
	data: Attendance
}

export function AttendanceStat({ data }: Props) {
	const color =
		data.ratePercent >= 90
			? '#22c98a'
			: data.ratePercent >= 75
				? '#4d9ef7'
				: data.ratePercent >= 60
					? '#f0a020'
					: '#e03535'
	return (
		<div
			className='rounded-[20px] p-3'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
			}}
		>
			<div className='text-[10px] uppercase tracking-wider text-app-muted'>
				посещаемость
			</div>
			<div className='text-[22px] font-semibold mt-1' style={{ color }}>
				{data.ratePercent}%
			</div>
			<div className='text-[10px] text-app-muted mt-0.5'>
				{data.absent} проп · {data.late} опозд
			</div>
		</div>
	)
}
