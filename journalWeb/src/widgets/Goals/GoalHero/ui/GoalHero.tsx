import type { ForecastResult, Risk } from '@/features/goalForecast'
import { GRADE_COLOR, RISK_BG, RISK_COLOR } from '@/shared/config'

interface Props {
	forecast: ForecastResult
	target: number | null
	onEdit: () => void
}

const riskLabel: Record<Risk, string> = {
	safe: 'на курсе',
	watch: 'на грани',
	danger: 'недобор',
	no_goal: 'без цели',
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(1)
}

export function GoalHero({ forecast, target, onEdit }: Props) {
	const color = RISK_COLOR[forecast.risk]
	const bg = RISK_BG[forecast.risk]
	return (
		<div
			className='rounded-[22px] p-4 mb-3 bg-app-surface'
			style={{
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between text-[10px] uppercase tracking-wider text-app-muted'>
				<span>Прогноз</span>
				<span>Цель</span>
			</div>
			<div className='flex items-baseline justify-between mt-1'>
				<span
					className='text-[30px] font-semibold'
					style={{ color: GRADE_COLOR[4] }}
				>
					{fmt(forecast.forecast)}
				</span>
				<span className='text-[30px] font-semibold text-app-text'>
					{target ?? '—'}
				</span>
			</div>
			<div className='flex justify-between items-center mt-2'>
				<span className='text-[11px] text-app-muted'>
					текущий{' '}
					<strong className='text-app-text'>{fmt(forecast.currentAvg)}</strong>
				</span>
				<span
					className='text-[10px] rounded-full px-2 py-0.5'
					style={{ color, background: bg }}
				>
					● {riskLabel[forecast.risk]}
				</span>
			</div>
			<button
				type='button'
				onClick={onEdit}
				className='w-full rounded-[14px] font-semibold text-[13px] mt-3 bg-app-surface-strong text-app-text border border-app-border active:scale-[0.99] transition-transform'
				style={{ minHeight: 48 }}
			>
				{target === null ? 'Поставить цель' : 'Изменить цель'}
			</button>
		</div>
	)
}
