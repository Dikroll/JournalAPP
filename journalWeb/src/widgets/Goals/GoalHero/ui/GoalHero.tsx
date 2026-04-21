import type { ForecastResult, Risk } from '@/features/goalForecast'

interface Props {
	forecast: ForecastResult
	target: number | null
	onEdit: () => void
}

const riskBadge: Record<Risk, { label: string; color: string }> = {
	safe: { label: '● на курсе', color: '#22c98a' },
	watch: { label: '● на грани', color: '#f0a020' },
	danger: { label: '● недобор', color: '#e03535' },
	no_goal: { label: '● без цели', color: '#8a94a6' },
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(1)
}

export function GoalHero({ forecast, target, onEdit }: Props) {
	const badge = riskBadge[forecast.risk]
	return (
		<div
			className='rounded-[22px] p-4 mb-3'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.14), rgba(242,159,5,0.08))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between text-[10px] uppercase tracking-wider text-app-muted'>
				<span>Прогноз</span>
				<span>Цель</span>
			</div>
			<div className='flex items-baseline justify-between mt-1'>
				<span className='text-[30px] font-semibold' style={{ color: '#4d9ef7' }}>
					{fmt(forecast.forecast)}
				</span>
				<span
					className='text-[30px] font-semibold'
					style={{ color: 'var(--color-brand)' }}
				>
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
					style={{
						color: badge.color,
						background: 'rgba(255,255,255,0.04)',
						border: `1px solid ${badge.color}33`,
					}}
				>
					{badge.label}
				</span>
			</div>
			<button
				type='button'
				onClick={onEdit}
				className='w-full rounded-[14px] text-white font-semibold text-[13px] mt-3'
				style={{ background: 'var(--color-brand)', minHeight: 48 }}
			>
				{target === null ? 'Поставить цель' : 'Изменить цель'}
			</button>
		</div>
	)
}
