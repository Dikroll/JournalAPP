import type { GoalCardData } from '@/features/goalForecast'
import { ChevronRight } from 'lucide-react'

interface Props {
	data: GoalCardData
	onPress: (specId: number) => void
}

const riskStyle: Record<
	GoalCardData['risk'],
	{ label: string; color: string; bg: string; border: string }
> = {
	safe: {
		label: 'на курсе',
		color: '#22c98a',
		bg: 'rgba(34,201,138,0.08)',
		border: 'rgba(34,201,138,0.28)',
	},
	watch: {
		label: 'на грани',
		color: '#f0a020',
		bg: 'rgba(240,160,32,0.08)',
		border: 'rgba(240,160,32,0.28)',
	},
	danger: {
		label: 'недобор',
		color: '#e03535',
		bg: 'rgba(224,53,53,0.06)',
		border: 'rgba(224,53,53,0.28)',
	},
	no_goal: {
		label: 'без цели',
		color: '#8a94a6',
		bg: 'transparent',
		border: 'var(--color-border)',
	},
}

function gradeColor(v: number | null): string {
	if (v === null) return '#8a94a6'
	if (v >= 5) return '#22c98a'
	if (v >= 4) return '#4d9ef7'
	if (v >= 3) return '#f0a020'
	return '#e03535'
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(1)
}

export function GoalCard({ data, onPress }: Props) {
	const style = riskStyle[data.risk]
	const surface =
		style.bg === 'transparent' ? 'var(--color-surface)' : style.bg
	return (
		<button
			type='button'
			onClick={() => onPress(data.specId)}
			className='w-full text-left rounded-[22px] p-4 mb-2 block active:scale-[0.99] transition-transform'
			style={{
				background: surface,
				border: `1px solid ${style.border}`,
				boxShadow: 'var(--shadow-card)',
				minHeight: 96,
			}}
		>
			<div className='flex items-center justify-between gap-2'>
				<strong className='text-[14px] text-app-text truncate'>
					{data.specName}
				</strong>
				<div className='flex items-center gap-1 shrink-0'>
					<span
						className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]'
						style={{
							color: style.color,
							background: 'rgba(255,255,255,0.04)',
							border: `1px solid ${style.color}33`,
						}}
					>
						● {style.label}
					</span>
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
						className='text-[20px] font-semibold mt-0.5'
						style={{ color: 'var(--color-brand)' }}
					>
						{data.target ?? '—'}
					</div>
				</div>
			</div>
		</button>
	)
}
