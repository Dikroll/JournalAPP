import { useOverallSummary } from '@/features/goalForecast'
import { pageConfig } from '@/shared/config'
import { ChevronRight, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

export function GoalsSummaryCard() {
	const summary = useOverallSummary()
	const navigate = useNavigate()

	const hasGoals = summary.totalSubjectsWithGoals > 0
	const handleClick = () => navigate(pageConfig.goals)

	if (!hasGoals) {
		return (
			<button
				type='button'
				onClick={handleClick}
				className='w-full rounded-[22px] p-4 mb-3 text-left flex items-center gap-3'
				style={{
					background: 'var(--color-brand-subtle)',
					border: '1px dashed var(--color-brand-border)',
					minHeight: 76,
				}}
			>
				<div
					className='rounded-[14px] flex items-center justify-center shrink-0'
					style={{
						width: 44,
						height: 44,
						background: 'var(--color-brand)',
						color: '#fff',
					}}
				>
					<Target size={22} />
				</div>
				<div className='flex-1 min-w-0'>
					<div className='text-[14px] font-semibold text-app-text'>
						Цели на семестр
					</div>
					<div className='text-[11px] text-app-muted mt-0.5'>
						Поставь цель — покажу прогноз и риск хвоста
					</div>
				</div>
				<ChevronRight size={18} className='text-app-muted shrink-0' />
			</button>
		)
	}

	const color =
		summary.risk === 'danger'
			? '#e03535'
			: summary.risk === 'watch'
				? '#f0a020'
				: summary.risk === 'safe'
					? '#22c98a'
					: '#8a94a6'

	const captionText =
		summary.atRiskCount > 0 ? `${summary.atRiskCount} в риске` : 'всё в норме'

	return (
		<button
			type='button'
			onClick={handleClick}
			className='w-full rounded-[22px] p-4 mb-3 text-left'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.10), rgba(242,159,5,0.05))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
				minHeight: 88,
			}}
		>
			<div className='flex items-center justify-between mb-1.5'>
				<div className='flex items-center gap-2'>
					<Target size={14} style={{ color: 'var(--color-brand)' }} />
					<span className='text-[11px] text-app-muted'>Цели семестра</span>
				</div>
				<div className='flex items-center gap-1.5'>
					<span
						className='text-[10px] rounded-full px-2 py-0.5'
						style={{
							color,
							background: 'rgba(255,255,255,0.04)',
							border: `1px solid ${color}33`,
						}}
					>
						● {captionText}
					</span>
					<ChevronRight size={16} className='text-app-muted' />
				</div>
			</div>
			<div className='flex items-baseline justify-between'>
				<div>
					<span
						className='text-[24px] font-semibold'
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
