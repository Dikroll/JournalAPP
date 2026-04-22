import type { GradeEntry } from '@/entities/grades'
import {
	currentAverage,
	whatIfAverage,
	type WhatIfFutureMark,
} from '@/features/goalForecast'
import type { GradeType } from '@/shared/types'
import { useMemo, useState } from 'react'

const VISIBLE_TYPES: GradeType[] = [
	'homework',
	'classwork',
	'control',
	'lab',
	'practical',
]

export interface RowState {
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

export interface WhatIfSimulatorVM {
	rows: Record<GradeType, RowState>
	present: GradeType[]
	current: number | null
	projected: number | null
	delta: number | null
	totalRepeats: number
	active: boolean
	setRepeat: (type: GradeType, next: number) => void
	setValue: (type: GradeType, next: 3 | 4 | 5) => void
	reset: () => void
}

export function useWhatIfSimulator(entries: GradeEntry[]): WhatIfSimulatorVM {
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

	const setRepeat = (type: GradeType, next: number) =>
		setRows(r => ({ ...r, [type]: { ...r[type], repeat: next } }))

	const setValue = (type: GradeType, next: 3 | 4 | 5) =>
		setRows(r => ({ ...r, [type]: { ...r[type], value: next } }))

	const reset = () =>
		setRows(r => {
			const next = { ...r }
			for (const t of present) next[t] = { ...next[t], repeat: 0 }
			return next
		})

	return {
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
	}
}
