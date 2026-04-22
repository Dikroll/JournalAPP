import { formatGradeOrEmpty } from '@/entities/goals/utils/goalLabels'
import type { GradeEntry } from '@/entities/grades'
import { useWhatIfSimulator } from '@/features/goalForecast'
import { gradeColor } from '@/shared/config'
import { Calculator, RotateCcw } from 'lucide-react'
import { WhatIfRow } from './WhatIfRow'

interface Props {
	entries: GradeEntry[]
}

export function WhatIfSimulator({ entries }: Props) {
	const {
		rows,
		present,
		current,
		projected,
		delta,
		totalRepeats,
		active,
		setRepeat,
		setValue,
		reset,
	} = useWhatIfSimulator(entries)

	return (
		<div className='mt-5'>
			<div className='flex items-center gap-2 px-1 mb-2'>
				<Calculator size={16} className='text-app-muted' />
				<span className='text-[13px] uppercase tracking-wider text-app-muted'>
					Калькулятор оценок
				</span>
			</div>

			<div
				className='rounded-[22px] p-4 mb-3'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				<div className='grid grid-cols-2 gap-2'>
					<div
						className='rounded-[16px] p-4'
						style={{ background: 'var(--color-surface-strong)' }}
					>
						<div className='text-[12px] text-app-text opacity-70'>сейчас</div>
						<div
							className='text-[28px] font-bold tabular-nums leading-none mt-1.5'
							style={{ color: gradeColor(current) }}
						>
							{formatGradeOrEmpty(current, 2)}
						</div>
					</div>
					<div
						className='rounded-[16px] p-4 transition-colors'
						style={{
							background: active
								? `${gradeColor(projected)}22`
								: 'var(--color-surface-strong)',
							border: `1px solid ${
								active ? `${gradeColor(projected)}55` : 'transparent'
							}`,
						}}
					>
						<div className='text-[12px] text-app-text opacity-70'>
							получится
						</div>
						<div
							className='text-[28px] font-bold tabular-nums leading-none mt-1.5'
							style={{ color: gradeColor(projected) }}
						>
							{formatGradeOrEmpty(projected, 2)}
						</div>
					</div>
				</div>

				<div className='flex items-center justify-between mt-3 pt-3 border-t border-app-border gap-3'>
					<span className='text-[12px] text-app-text opacity-70 leading-snug'>
						{active
							? `+${totalRepeats} будущих оценок`
							: 'добавь оценки ниже - будет новый балл'}
					</span>
					{active && delta !== null ? (
						<span
							className='text-[14px] font-semibold tabular-nums shrink-0'
							style={{
								color:
									delta > 0.01
										? gradeColor(5)
										: delta < -0.01
										? gradeColor(2)
										: 'var(--color-text-muted)',
							}}
						>
							{delta > 0 ? '+' : ''}
							{delta.toFixed(2)}
						</span>
					) : null}
					{active && (
						<button
							type='button'
							onClick={reset}
							aria-label='Сбросить'
							className='flex items-center gap-1 text-[12px] text-app-muted active:opacity-60 shrink-0'
						>
							<RotateCcw size={14} />
							Сбросить
						</button>
					)}
				</div>
			</div>

			{present.map(type => (
				<WhatIfRow
					key={type}
					type={type}
					value={rows[type].value}
					repeat={rows[type].repeat}
					onChangeRepeat={next => setRepeat(type, next)}
					onChangeValue={next => setValue(type, next)}
				/>
			))}
		</div>
	)
}
