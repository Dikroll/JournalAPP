import type { Attendance } from '@/features/goalForecast'
import { GRADE_COLOR, NEUTRAL_COLOR } from '@/shared/config'

interface Props {
	data: Attendance
}

export function AttendanceStat({ data }: Props) {
	const color =
		data.ratePercent >= 90
			? GRADE_COLOR[5]
			: data.ratePercent >= 75
				? GRADE_COLOR[4]
				: data.ratePercent >= 60
					? GRADE_COLOR[3]
					: data.ratePercent >= 40
						? GRADE_COLOR[2]
						: NEUTRAL_COLOR
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
				посещаемость
			</div>
			<div
				className='text-[24px] font-semibold mt-1.5 tabular-nums'
				style={{ color }}
			>
				{data.ratePercent}%
			</div>
			<div className='text-[12px] text-app-muted mt-1'>
				{data.absent} проп · {data.late} опозд
			</div>
		</div>
	)
}
