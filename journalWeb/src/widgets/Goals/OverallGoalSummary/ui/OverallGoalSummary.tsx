import type { OverallSummary } from '@/features/goalForecast'

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

	return (
		<div
			className='rounded-[22px] p-4 mb-3'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.14), rgba(242,159,5,0.08))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between text-[11px] text-app-muted mb-1'>
				<span>Сессия целиком</span>
				<span>{riskText}</span>
			</div>
			<div className='flex items-baseline justify-between'>
				<div>
					<span className='text-[28px] font-semibold' style={{ color: 'var(--color-brand)' }}>
						{fmt(summary.forecast)}
					</span>
					<span className='text-[11px] text-app-muted ml-1.5'>прогноз</span>
				</div>
				<div className='text-[11px] text-app-muted'>
					цель <strong className='text-app-text'>{fmt(summary.target)}</strong>
				</div>
			</div>
			<div
				className='h-1 rounded-full mt-2 overflow-hidden'
				style={{ background: 'rgba(255,255,255,0.08)' }}
			>
				<div
					className='h-full rounded-full'
					style={{
						width: `${progressPct}%`,
						background: 'linear-gradient(90deg, var(--color-gradient-from), var(--color-gradient-to))',
					}}
				/>
			</div>
		</div>
	)
}
