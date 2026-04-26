import {
	formatGradeOrEmpty,
	getCompletionLabel,
	getRiskLabel,
	gradeColor,
	RISK_BG,
	RISK_COLOR,
} from '@/entities/goals'
import type { GoalCardData } from '@/features/goalForecast'
import { Check, ChevronRight } from 'lucide-react'

interface Props {
	data: GoalCardData
	onPress: (specId: number) => void
}

export function GoalCard({ data, onPress }: Props) {
	const color = RISK_COLOR[data.risk]
	const bg = RISK_BG[data.risk]
	return (
		<button
			type='button'
			onClick={() => onPress(data.specId)}
			className='w-full text-left rounded-[22px] p-4 mb-2 block active:scale-[0.99] transition-transform bg-app-surface'
			style={{
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
				minHeight: 112,
				opacity: data.completed ? 0.75 : 1,
			}}
		>
			<div className='flex items-center justify-between gap-2'>
				<strong className='text-[15px] text-app-text truncate'>
					{data.specName}
				</strong>
				<div className='flex items-center gap-1 shrink-0'>
					{data.completed ? (
						<span
							className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] text-app-muted'
							style={{ background: 'var(--color-surface-strong)' }}
						>
							<Check size={12} />
							{getCompletionLabel(data.completionReason ?? 'stale')}
						</span>
					) : (
						<span
							className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px]'
							style={{ color, background: bg }}
						>
							● {getRiskLabel(data.risk)}
						</span>
					)}
					<ChevronRight size={18} className='text-app-muted' />
				</div>
			</div>
			<div className='grid grid-cols-3 mt-4 gap-2'>
				<div>
					<div className='text-[12px] uppercase tracking-wider text-app-muted'>
						сейчас
					</div>
					<div className='text-[24px] font-semibold text-app-text mt-1 tabular-nums leading-none'>
						{formatGradeOrEmpty(data.currentAvg, 1)}
					</div>
				</div>
				<div className='text-center'>
					<div className='text-[12px] uppercase tracking-wider text-app-muted'>
						прогноз
					</div>
					<div
						className='text-[24px] font-semibold mt-1 tabular-nums leading-none'
						style={{ color: gradeColor(data.forecast) }}
					>
						{formatGradeOrEmpty(data.forecast, 1)}
					</div>
				</div>
				<div className='text-right'>
					<div className='text-[12px] uppercase tracking-wider text-app-muted'>
						цель
					</div>
					<div
						className='text-[24px] font-semibold mt-1 text-app-text tabular-nums leading-none'
						style={{ opacity: data.target === null ? 0.5 : 1 }}
					>
						{data.target ?? '—'}
					</div>
				</div>
			</div>
		</button>
	)
}
