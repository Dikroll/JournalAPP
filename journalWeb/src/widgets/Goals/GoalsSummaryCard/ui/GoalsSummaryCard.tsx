import { lastValue, useDashboardChartsStore } from '@/entities/dashboard'
import { useGrades } from '@/entities/grades'
import { useOverallSummary } from '@/features/goalForecast'
import {
	GRADE_BG,
	GRADE_COLOR,
	type Mark,
	pageConfig,
	RISK_BG,
	RISK_COLOR,
} from '@/shared/config'
import { ChevronRight, Target } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

function pickBadgeLabel(
	risk: ReturnType<typeof useOverallSummary>['risk'],
	atRiskCount: number,
	totalSubjectsWithGoals: number,
): string {
	if (totalSubjectsWithGoals === 0) return 'поставь цели'
	if (risk === 'danger' || risk === 'watch') return `${atRiskCount} в риске`
	return 'цели в норме'
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
		const counts: Record<Mark, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
		for (const e of entries) {
			if (!e.marks) continue
			for (const v of Object.values(e.marks)) {
				if (typeof v === 'number' && v >= 1 && v <= 5) {
					counts[v as Mark] += 1
				}
			}
		}
		return counts
	}, [entries])

	const totalMarks =
		distribution[1] +
		distribution[2] +
		distribution[3] +
		distribution[4] +
		distribution[5]

	const badgeRisk =
		summary.totalSubjectsWithGoals === 0 ? 'no_goal' : summary.risk
	const badgeLabel = pickBadgeLabel(
		summary.risk,
		summary.atRiskCount,
		summary.totalSubjectsWithGoals,
	)

	return (
		<button
			type='button'
			onClick={() => navigate(pageConfig.goals)}
			className='w-full text-left rounded-[24px] p-5 border border-app-border bg-app-surface active:scale-[0.99] transition-transform'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center justify-between mb-5'>
				<div className='flex items-center gap-2'>
					<Target size={14} className='text-app-muted' />
					<span className='text-[11px] uppercase tracking-wider text-app-muted'>
						Сводка оценок
					</span>
				</div>
				<ChevronRight size={18} className='text-app-muted' />
			</div>

			<div className='grid grid-cols-3 gap-3 mb-5'>
				<div>
					<div className='text-[28px] font-bold text-app-text leading-none tabular-nums'>
						{avg != null ? avg.toFixed(1) : '—'}
					</div>
					<div className='text-[11px] text-app-muted mt-1.5'>средний балл</div>
				</div>
				<div>
					<div
						className='text-[28px] font-bold leading-none tabular-nums'
						style={{ color: GRADE_COLOR[4] }}
					>
						{att != null ? `${att}%` : '—'}
					</div>
					<div className='text-[11px] text-app-muted mt-1.5'>посещаемость</div>
				</div>
				<div>
					<div className='text-[28px] font-bold text-app-text leading-none tabular-nums'>
						{totalMarks}
					</div>
					<div className='text-[11px] text-app-muted mt-1.5'>всего оценок</div>
				</div>
			</div>

			{totalMarks > 0 && (
				<>
					<div
						className='flex rounded-full overflow-hidden mb-3'
						style={{ height: 8 }}
					>
						{([5, 4, 3, 2, 1] as const).map(v => {
							const pct = (distribution[v] / totalMarks) * 100
							if (pct === 0) return null
							return (
								<div
									key={v}
									style={{
										width: `${pct}%`,
										background: GRADE_COLOR[v],
									}}
								/>
							)
						})}
					</div>

					<div className='grid grid-cols-5 gap-1.5 mb-4'>
						{([5, 4, 3, 2, 1] as const).map(v => {
							const count = distribution[v]
							const pct =
								totalMarks > 0
									? Math.round((count / totalMarks) * 100)
									: 0
							return (
								<div
									key={v}
									className='rounded-[12px] px-2 py-2 flex flex-col items-start'
									style={{
										background: GRADE_BG[v],
										opacity: count === 0 ? 0.45 : 1,
									}}
								>
									<span
										className='text-[16px] font-bold leading-none tabular-nums'
										style={{ color: GRADE_COLOR[v] }}
									>
										{count}
									</span>
									<div className='flex items-baseline justify-between w-full mt-1'>
										<span className='text-[10px] text-app-muted'>× {v}</span>
										<span className='text-[9px] text-app-muted tabular-nums'>
											{pct}%
										</span>
									</div>
								</div>
							)
						})}
					</div>
				</>
			)}

			<div className='flex items-center justify-between pt-3 border-t border-app-border'>
				<span
					className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium'
					style={{
						color: RISK_COLOR[badgeRisk],
						background: RISK_BG[badgeRisk],
					}}
				>
					● {badgeLabel}
				</span>
				{summary.totalSubjectsWithGoals > 0 && (
					<span className='text-[11px] text-app-muted'>
						прогноз{' '}
						<strong className='text-app-text'>{fmt(summary.forecast)}</strong> ·
						цель{' '}
						<strong className='text-app-text'>{fmt(summary.target)}</strong>
					</span>
				)}
			</div>
		</button>
	)
}
