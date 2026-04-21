import type { GoalCardData } from '@/features/goalForecast'

interface Props {
	data: GoalCardData
	onPress: (specId: number) => void
}

const riskStyle: Record<GoalCardData['risk'], { label: string; color: string; bg: string; border: string }> = {
	safe: { label: 'на курсе', color: '#22c98a', bg: 'rgba(34,201,138,0.08)', border: 'rgba(34,201,138,0.28)' },
	watch: { label: 'на грани', color: '#f0a020', bg: 'rgba(240,160,32,0.08)', border: 'rgba(240,160,32,0.28)' },
	danger: { label: 'недобор', color: '#e03535', bg: 'rgba(224,53,53,0.06)', border: 'rgba(224,53,53,0.28)' },
	no_goal: { label: 'без цели', color: '#8a94a6', bg: 'transparent', border: 'var(--color-border)' },
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
	return (
		<button
			type='button'
			onClick={() => onPress(data.specId)}
			className='w-full text-left rounded-[22px] p-4 mb-2 block'
			style={{
				background: style.bg === 'transparent' ? 'var(--color-surface)' : style.bg,
				border: `1px solid ${style.border}`,
				boxShadow: 'var(--shadow-card)',
				minHeight: 88,
			}}
		>
			<div className='flex items-center justify-between'>
				<strong className='text-[14px] text-app-text'>{data.specName}</strong>
				<span
					className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]'
					style={{ color: style.color, background: style.bg === 'transparent' ? 'var(--color-surface)' : style.bg, border: `1px solid ${style.border}` }}
				>
					● {style.label}
				</span>
			</div>
			<div className='flex justify-between mt-2 text-[11px] text-app-muted'>
				<span>сейчас</span>
				<span>прогноз</span>
				<span>цель</span>
			</div>
			<div className='flex justify-between mt-0.5'>
				<span className='text-[20px] font-semibold text-app-text'>{fmt(data.currentAvg)}</span>
				<span className='text-[20px] font-semibold' style={{ color: gradeColor(data.forecast) }}>
					{fmt(data.forecast)}
				</span>
				<span className='text-[20px] font-semibold' style={{ color: 'var(--color-brand)' }}>
					{data.target ?? '—'}
				</span>
			</div>
		</button>
	)
}
