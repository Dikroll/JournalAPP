import { useOverallSummary } from '@/features/goalForecast'
import { pageConfig } from '@/shared/config'
import { useNavigate } from 'react-router-dom'

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

export function GoalsSummaryCard() {
	const summary = useOverallSummary()
	const navigate = useNavigate()

	if (summary.totalSubjectsWithGoals === 0 && summary.atRiskCount === 0)
		return null

	const color =
		summary.risk === 'danger'
			? '#e03535'
			: summary.risk === 'watch'
				? '#f0a020'
				: summary.risk === 'safe'
					? '#22c98a'
					: '#8a94a6'

	const captionText =
		summary.totalSubjectsWithGoals === 0
			? `${summary.atRiskCount} в риске`
			: summary.atRiskCount > 0
				? `${summary.atRiskCount} в риске`
				: 'всё в норме'

	return (
		<button
			type='button'
			onClick={() => navigate(pageConfig.goals)}
			className='w-full rounded-[22px] p-4 mb-3 text-left'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.10), rgba(242,159,5,0.05))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
				minHeight: 88,
			}}
		>
			<div className='flex justify-between text-[11px] text-app-muted mb-1'>
				<span>Цели семестра</span>
				<span style={{ color }}>{captionText}</span>
			</div>
			<div className='flex items-baseline justify-between'>
				<div>
					<span
						className='text-[22px] font-semibold'
						style={{ color: 'var(--color-brand)' }}
					>
						{fmt(summary.forecast)}
					</span>
					<span className='text-[11px] text-app-muted ml-1.5'>прогноз</span>
				</div>
				<div className='text-[11px] text-app-muted'>
					цель <strong className='text-app-text'>{fmt(summary.target)}</strong>
				</div>
			</div>
		</button>
	)
}
