import {
	formatGradeOrEmpty,
	getRiskLabel,
} from '@/entities/goals/utils/goalLabels'
import type { ForecastResult } from '@/features/goalForecast'
import { GRADE_COLOR, RISK_BG, RISK_COLOR } from '@/shared/config'

interface Props {
	forecast: ForecastResult
	target: number | null
	onEdit: () => void
}

export function GoalHero({ forecast, target, onEdit }: Props) {
	const color = RISK_COLOR[forecast.risk]
	const bg = RISK_BG[forecast.risk]
	return (
		<div
			className='rounded-[22px] p-5 mb-3 bg-app-surface'
			style={{
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between text-[12px] uppercase tracking-wider text-app-muted'>
				<span>Прогноз</span>
				<span>Цель</span>
			</div>
			<div className='flex items-baseline justify-between mt-1.5'>
				<span
					className='text-[32px] font-semibold tabular-nums leading-none'
					style={{ color: GRADE_COLOR[4] }}
				>
					{formatGradeOrEmpty(forecast.forecast, 1)}
				</span>
				<span className='text-[32px] font-semibold text-app-text tabular-nums leading-none'>
					{target ?? '—'}
				</span>
			</div>
			<div className='flex justify-between items-center mt-3'>
				<span className='text-[13px] text-app-muted'>
					текущий{' '}
					<strong className='text-app-text tabular-nums'>
						{formatGradeOrEmpty(forecast.currentAvg, 1)}
					</strong>
				</span>
				<span
					className='text-[12px] font-medium rounded-full px-2.5 py-1'
					style={{ color, background: bg }}
				>
					● {getRiskLabel(forecast.risk)}
				</span>
			</div>
			<button
				type='button'
				onClick={onEdit}
				className='w-full rounded-[14px] font-semibold text-[14px] mt-4 bg-app-surface-strong text-app-text border border-app-border active:scale-[0.99] transition-transform'
				style={{ minHeight: 48 }}
			>
				{target === null ? 'Поставить цель' : 'Изменить цель'}
			</button>
		</div>
	)
}
