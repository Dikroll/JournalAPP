import type { OverallSummary } from '@/features/goalForecast'
import { gradeColor } from '@/shared/config'

interface Props {
	summary: OverallSummary
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

export function OverallGoalSummary({ summary }: Props) {
	const riskText =
		summary.totalSubjectsWithGoals === 0
			? 'цели не заданы'
			: summary.atRiskCount === 0
				? 'всё в норме'
				: `${summary.atRiskCount} в риске`

	const progressPct =
		summary.forecast !== null && summary.target
			? Math.min(100, Math.round((summary.forecast / summary.target) * 100))
			: 0

	const forecastColor = gradeColor(summary.forecast)

	return (
		<div
			className='rounded-[22px] p-5 mb-3 bg-app-surface'
			style={{
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between items-center text-[12px] text-app-muted mb-2'>
				<span>Сессия целиком</span>
				<span>{riskText}</span>
			</div>
			<div className='flex items-baseline justify-between'>
				<div className='flex items-baseline gap-2'>
					<span
						className='text-[30px] font-bold tabular-nums leading-none'
						style={{ color: forecastColor }}
					>
						{fmt(summary.forecast)}
					</span>
					<span className='text-[12px] text-app-muted'>прогноз</span>
				</div>
				<div className='text-[12px] text-app-muted'>
					цель{' '}
					<strong className='text-app-text tabular-nums'>
						{fmt(summary.target)}
					</strong>
				</div>
			</div>
			<div
				className='h-1.5 rounded-full mt-3 overflow-hidden'
				style={{ background: 'var(--color-surface-strong)' }}
			>
				<div
					className='h-full rounded-full transition-all'
					style={{
						width: `${progressPct}%`,
						background: forecastColor,
					}}
				/>
			</div>
		</div>
	)
}
