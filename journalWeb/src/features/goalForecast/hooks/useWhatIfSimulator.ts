import type { GradeEntry } from '@/entities/grades'
import type { GradeType } from '@/shared/types'
import { useMemo, useState } from 'react'
import { currentAverage } from '../lib/forecast'
import { type WhatIfFutureMark, whatIfAverage } from '../lib/whatIf'

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
		for (const entry of entries) {
			if (!entry.marks) continue
			for (const [type, value] of Object.entries(entry.marks) as [
				GradeType,
				number | null,
			][]) {
				if (value !== null && value !== 0) seen.add(type)
			}
		}
		return VISIBLE_TYPES.filter(type => seen.has(type))
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

	const totalRepeats = future.reduce((sum, mark) => sum + mark.repeat, 0)
	const active = totalRepeats > 0
	const delta =
		projected !== null && current !== null ? projected - current : null

	const setRepeat = (type: GradeType, next: number) =>
		setRows(currentRows => ({
			...currentRows,
			[type]: { ...currentRows[type], repeat: next },
		}))

	const setValue = (type: GradeType, next: 3 | 4 | 5) =>
		setRows(currentRows => ({
			...currentRows,
			[type]: { ...currentRows[type], value: next },
		}))

	const reset = () =>
		setRows(currentRows => {
			const nextRows = { ...currentRows }
			for (const type of present) {
				nextRows[type] = { ...nextRows[type], repeat: 0 }
			}
			return nextRows
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
