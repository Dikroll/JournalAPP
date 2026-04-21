import type { GradeEntry } from '@/entities/grades'
import { currentAverage } from '@/features/goalForecast'
import { whatIfAverage, type WhatIfFutureMark } from '@/features/goalForecast'
import { gradeColor } from '@/shared/config'
import type { GradeType } from '@/shared/types'
import { Calculator, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WhatIfRow } from './WhatIfRow'

interface Props {
	entries: GradeEntry[]
}

const VISIBLE_TYPES: GradeType[] = [
	'homework',
	'classwork',
	'control',
	'lab',
	'practical',
]

interface RowState {
	value: 3 | 4 | 5
	repeat: number
}

const INITIAL_ROWS: Record<GradeType, RowState> = {
	homework: { value: 5, repeat: 0 },
	classwork: { value: 5, repeat: 0 },
	control: { value: 4, repeat: 0 },
	lab: { value: 5, repeat: 0 },
	practical: { value: 5, repeat: 0 },
	final: { value: 5, repeat: 0 },
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

export function WhatIfSimulator({ entries }: Props) {
	const [rows, setRows] = useState<Record<GradeType, RowState>>(INITIAL_ROWS)

	const present = useMemo(() => {
		const seen = new Set<GradeType>()
		for (const e of entries) {
			if (!e.marks) continue
			for (const [type, v] of Object.entries(e.marks) as [
				GradeType,
				number | null,
			][]) {
				if (v !== null && v !== 0) seen.add(type)
			}
		}
		return VISIBLE_TYPES.filter(t => seen.has(t))
	}, [entries])

	const future: WhatIfFutureMark[] = useMemo(
		() =>
			present.map(type => ({
				type,
				value: rows[type].value,
				repeat: rows[type].repeat,
			})),
		[present, rows],
	)

	const current = useMemo(() => currentAverage(entries), [entries])
	const projected = useMemo(
		() => whatIfAverage(entries, future),
		[entries, future],
	)

	const totalRepeats = future.reduce((s, f) => s + f.repeat, 0)
	const active = totalRepeats > 0
	const delta =
		projected !== null && current !== null ? projected - current : null

	const reset = () =>
		setRows(r => {
			const next = { ...r }
			for (const t of present) next[t] = { ...next[t], repeat: 0 }
			return next
		})

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
							{fmt(current)}
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
							{fmt(projected)}
						</div>
					</div>
				</div>

				<div className='flex items-center justify-between mt-3 pt-3 border-t border-app-border gap-3'>
					<span className='text-[12px] text-app-text opacity-70 leading-snug'>
						{active
							? `+${totalRepeats} будущих оценок`
							: 'добавь оценки ниже — покажу новый средний'}
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
					onChangeRepeat={next =>
						setRows(r => ({ ...r, [type]: { ...r[type], repeat: next } }))
					}
					onChangeValue={next =>
						setRows(r => ({ ...r, [type]: { ...r[type], value: next } }))
					}
				/>
			))}
		</div>
	)
}
