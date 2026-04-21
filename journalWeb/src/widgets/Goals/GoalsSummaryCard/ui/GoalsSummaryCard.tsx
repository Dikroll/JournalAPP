import { useOverallSummary } from '@/features/goalForecast'
import { pageConfig } from '@/shared/config'
import { Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

interface Badge {
	label: string
	color: string
	bg: string
	Icon: typeof TrendingUp | null
}

function pickBadge(
	risk: ReturnType<typeof useOverallSummary>['risk'],
	atRiskCount: number,
	totalSubjectsWithGoals: number,
): Badge {
	if (totalSubjectsWithGoals === 0) {
		return {
			label: 'без целей',
			color: '#8a94a6',
			bg: 'rgba(138,148,166,0.12)',
			Icon: null,
		}
	}
	if (risk === 'danger' || risk === 'watch') {
		return {
			label: `${atRiskCount} в риске`,
			color: risk === 'danger' ? '#e03535' : '#f0a020',
			bg:
				risk === 'danger'
					? 'rgba(224,53,53,0.14)'
					: 'rgba(240,160,32,0.14)',
			Icon: TrendingDown,
		}
	}
	return {
		label: 'всё в норме',
		color: '#22c98a',
		bg: 'rgba(34,201,138,0.14)',
		Icon: TrendingUp,
	}
}

export function GoalsSummaryCard() {
	const summary = useOverallSummary()
	const navigate = useNavigate()
	const badge = pickBadge(
		summary.risk,
		summary.atRiskCount,
		summary.totalSubjectsWithGoals,
	)
	const { Icon } = badge

	const headline =
		summary.totalSubjectsWithGoals === 0
			? 'Поставь'
			: fmt(summary.forecast)

	return (
		<button
			type='button'
			onClick={() => navigate(pageConfig.goals)}
			className='relative w-full text-left rounded-[24px] p-4 border border-app-border bg-app-surface overflow-hidden active:scale-[0.99] transition-transform'
			style={{ minHeight: 156 }}
		>
			<div className='flex items-center justify-between'>
				<span className='text-xs text-app-muted'>Цели семестра</span>
				<Target size={16} className='text-app-muted' />
			</div>

			<div className='mt-3'>
				<div
					className='text-[34px] font-bold leading-none text-app-text'
					style={{
						letterSpacing: summary.totalSubjectsWithGoals === 0 ? 0 : '-0.5px',
					}}
				>
					{headline}
				</div>
			</div>

			<div className='mt-3 flex items-center gap-2 flex-wrap'>
				<span
					className='inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium'
					style={{ color: badge.color, background: badge.bg }}
				>
					{Icon && <Icon size={12} />}
					{badge.label}
				</span>
				{summary.totalSubjectsWithGoals > 0 && summary.target !== null && (
					<span className='text-[11px] text-app-muted'>
						цель{' '}
						<strong className='text-app-text'>{fmt(summary.target)}</strong>
					</span>
				)}
			</div>

			<svg
				aria-hidden
				viewBox='0 0 320 60'
				preserveAspectRatio='none'
				className='absolute left-0 right-0 bottom-0 w-full'
				style={{ height: 52, pointerEvents: 'none' }}
			>
				<defs>
					<linearGradient id='goalsCardStroke' x1='0' y1='0' x2='1' y2='0'>
						<stop offset='0%' stopColor='#F20519' />
						<stop offset='100%' stopColor='#F29F05' />
					</linearGradient>
				</defs>
				<path
					d='M0 40 C 40 10, 80 55, 130 38 S 230 10, 280 30 S 320 38, 320 38'
					fill='none'
					stroke='url(#goalsCardStroke)'
					strokeWidth='2.5'
					strokeLinecap='round'
					opacity='0.9'
				/>
			</svg>
		</button>
	)
}
