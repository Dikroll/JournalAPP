import { lastValue, useDashboardChartsStore } from '@/entities/dashboard'
import { useGrades } from '@/entities/grades'
import { useOverallSummary } from '@/features/goalForecast'
import { pageConfig } from '@/shared/config'
import { ChevronRight, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

type Mark = 2 | 3 | 4 | 5

const MARK_COLOR: Record<Mark, string> = {
	5: '#22c98a',
	4: '#4d9ef7',
	3: '#f0a020',
	2: '#e03535',
}

const MARK_BG: Record<Mark, string> = {
	5: 'rgba(34,201,138,0.12)',
	4: 'rgba(77,158,247,0.12)',
	3: 'rgba(240,160,32,0.12)',
	2: 'rgba(224,53,53,0.12)',
}

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
			label: 'поставь цели',
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
		label: 'цели в норме',
		color: '#22c98a',
		bg: 'rgba(34,201,138,0.14)',
		Icon: TrendingUp,
	}
}

export function GoalsSummaryCard() {
	const navigate = useNavigate()
	const progress = useDashboardChartsStore(s => s.progress)
	const attendance = useDashboardChartsStore(s => s.attendance)
	const { entries } = useGrades()
	const summary = useOverallSummary()

	const avg = lastValue(progress)
	const att = lastValue(attendance)

	const distribution = useMemo(() => {
		const counts: Record<Mark, number> = { 2: 0, 3: 0, 4: 0, 5: 0 }
		for (const e of entries) {
			if (!e.marks) continue
			for (const v of Object.values(e.marks)) {
				if (typeof v === 'number' && v >= 2 && v <= 5) {
					counts[v as Mark] += 1
				}
			}
		}
		return counts
	}, [entries])

	const totalMarks =
		distribution[2] + distribution[3] + distribution[4] + distribution[5]

	const badge = pickBadge(
		summary.risk,
		summary.atRiskCount,
		summary.totalSubjectsWithGoals,
	)
	const { Icon } = badge

	return (
		<button
			type='button'
			onClick={() => navigate(pageConfig.goals)}
			className='w-full text-left rounded-[24px] p-4 border border-app-border bg-app-surface active:scale-[0.99] transition-transform'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center gap-2'>
					<Target size={14} className='text-app-muted' />
					<span className='text-[11px] uppercase tracking-wider text-app-muted'>
						Сводка семестра
					</span>
				</div>
				<ChevronRight size={18} className='text-app-muted' />
			</div>

			<div className='grid grid-cols-2 gap-3 mb-4'>
				<div>
					<div className='text-[32px] font-bold text-app-text leading-none'>
						{avg != null ? avg.toFixed(1) : '—'}
					</div>
					<div className='text-[11px] text-app-muted mt-1.5'>средний балл</div>
				</div>
				<div className='text-right'>
					<div
						className='text-[32px] font-bold leading-none'
						style={{ color: '#4d9ef7' }}
					>
						{att != null ? `${att}%` : '—'}
					</div>
					<div className='text-[11px] text-app-muted mt-1.5'>посещаемость</div>
				</div>
			</div>

			{totalMarks > 0 && (
				<>
					<div className='text-[10px] uppercase tracking-wider text-app-muted mb-2'>
						Распределение · {totalMarks} оц
					</div>
					<div className='grid grid-cols-4 gap-2 mb-4'>
						{([5, 4, 3, 2] as const).map(v => (
							<div
								key={v}
								className='rounded-[14px] px-2 py-2.5 flex flex-col items-start'
								style={{
									background: MARK_BG[v],
									border: `1px solid ${MARK_COLOR[v]}33`,
								}}
							>
								<span
									className='text-[18px] font-bold leading-none'
									style={{ color: MARK_COLOR[v] }}
								>
									{distribution[v]}
								</span>
								<span className='text-[10px] text-app-muted mt-1'>× {v}</span>
							</div>
						))}
					</div>
				</>
			)}

			<div className='flex items-center justify-between pt-3 border-t border-app-border'>
				<span
					className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium'
					style={{ color: badge.color, background: badge.bg }}
				>
					{Icon && <Icon size={12} />}● {badge.label}
				</span>
				{summary.totalSubjectsWithGoals > 0 && (
					<span className='text-[11px] text-app-muted'>
						прогноз{' '}
						<strong className='text-app-text'>{fmt(summary.forecast)}</strong>{' '}
						· цель{' '}
						<strong className='text-app-text'>{fmt(summary.target)}</strong>
					</span>
				)}
			</div>
		</button>
	)
}
