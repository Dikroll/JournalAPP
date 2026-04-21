import type { GoalCardData } from '@/features/goalForecast'
import { gradeColor, RISK_BG, RISK_COLOR } from '@/shared/config'
import { Check, ChevronRight } from 'lucide-react'

interface Props {
	data: GoalCardData
	onPress: (specId: number) => void
}

const riskLabel: Record<GoalCardData['risk'], string> = {
	safe: 'на курсе',
	watch: 'на грани',
	danger: 'недобор',
	no_goal: 'без цели',
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(1)
}

function completionLabel(data: GoalCardData): string {
	if (data.completionReason === 'final_mark') return 'зачёт получен'
	if (data.completionReason === 'stale') return 'завершён'
	return 'завершён'
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
				minHeight: 96,
				opacity: data.completed ? 0.75 : 1,
			}}
		>
			<div className='flex items-center justify-between gap-2'>
				<strong className='text-[14px] text-app-text truncate'>
					{data.specName}
				</strong>
				<div className='flex items-center gap-1 shrink-0'>
					{data.completed ? (
						<span
							className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-app-muted'
							style={{ background: 'var(--color-surface-strong)' }}
						>
							<Check size={10} />
							{completionLabel(data)}
						</span>
					) : (
						<span
							className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]'
							style={{ color, background: bg }}
						>
							● {riskLabel[data.risk]}
						</span>
					)}
					<ChevronRight size={16} className='text-app-muted' />
				</div>
			</div>
			<div className='grid grid-cols-3 mt-3 gap-1'>
				<div>
					<div className='text-[10px] uppercase tracking-wider text-app-muted'>
						сейчас
					</div>
					<div className='text-[20px] font-semibold text-app-text mt-0.5'>
						{fmt(data.currentAvg)}
					</div>
				</div>
				<div className='text-center'>
					<div className='text-[10px] uppercase tracking-wider text-app-muted'>
						прогноз
					</div>
					<div
						className='text-[20px] font-semibold mt-0.5'
						style={{ color: gradeColor(data.forecast) }}
					>
						{fmt(data.forecast)}
					</div>
				</div>
				<div className='text-right'>
					<div className='text-[10px] uppercase tracking-wider text-app-muted'>
						цель
					</div>
					<div
						className='text-[20px] font-semibold mt-0.5 text-app-text'
						style={{ opacity: data.target === null ? 0.5 : 1 }}
					>
						{data.target ?? '—'}
					</div>
				</div>
			</div>
		</button>
	)
}
