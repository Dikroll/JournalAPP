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
		<div className='mt-4'>
			<div className='flex items-center gap-2 px-1 mb-3'>
				<Calculator size={14} className='text-app-muted' />
				<span className='text-[11px] uppercase tracking-wider text-app-muted'>
					Калькулятор оценок
				</span>
			</div>

			<div
				className='rounded-[22px] p-5 mb-3'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				<div className='flex items-end justify-between gap-4'>
					<div className='min-w-0'>
						<div className='text-[11px] text-app-muted'>сейчас</div>
						<div
							className='text-[22px] font-semibold tabular-nums leading-tight'
							style={{ color: gradeColor(current) }}
						>
							{fmt(current)}
						</div>
					</div>

					<div className='flex-1 flex items-center justify-center'>
						<div
							className='h-px w-full'
							style={{ background: 'var(--color-border)' }}
						/>
					</div>

					<div className='text-right min-w-0'>
						<div className='text-[11px] text-app-muted'>получится</div>
						<div
							className='text-[28px] font-bold tabular-nums leading-tight'
							style={{ color: gradeColor(projected) }}
						>
							{fmt(projected)}
						</div>
					</div>
				</div>

				{active && delta !== null && (
					<div className='flex items-center justify-between mt-3 pt-3 border-t border-app-border'>
						<span className='text-[11px] text-app-muted'>
							+{totalRepeats} оценок
						</span>
						<span
							className='text-[12px] font-semibold tabular-nums'
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
					</div>
				)}
			</div>

			<div className='flex items-center justify-between px-1 mb-2'>
				<span className='text-[11px] text-app-muted'>
					Добавь будущие оценки, чтобы увидеть новый средний
				</span>
				{active && (
					<button
						type='button'
						onClick={reset}
						className='flex items-center gap-1 text-[11px] text-app-muted active:opacity-60'
					>
						<RotateCcw size={12} />
						Сбросить
					</button>
				)}
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
