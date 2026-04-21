import type { GradeEntry } from '@/entities/grades'
import { whatIfAverage, type WhatIfFutureMark } from '@/features/goalForecast'
import type { GradeType } from '@/shared/types'
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

export function WhatIfSimulator({ entries }: Props) {
	const [rows, setRows] = useState<Record<GradeType, RowState>>(() => ({
		homework: { value: 5, repeat: 0 },
		classwork: { value: 5, repeat: 0 },
		control: { value: 4, repeat: 0 },
		lab: { value: 5, repeat: 0 },
		practical: { value: 5, repeat: 0 },
		final: { value: 5, repeat: 0 },
	}))

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

	const projected = useMemo(
		() => whatIfAverage(entries, future),
		[entries, future],
	)

	const totalRepeats = future.reduce((s, f) => s + f.repeat, 0)

	return (
		<div>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
				What-if — если я получу…
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
			{totalRepeats > 0 && (
				<div
					className='rounded-[20px] px-3.5 py-3 text-center'
					style={{
						background: 'var(--color-brand-subtle)',
						border: '1px solid var(--color-brand-border)',
					}}
				>
					<span className='text-app-muted text-[11px]'>итого выйдет</span>
					<strong
						className='ml-2 text-[20px]'
						style={{ color: 'var(--color-brand)' }}
					>
						{projected === null ? '—' : projected.toFixed(2)}
					</strong>
				</div>
			)}
		</div>
	)
}
