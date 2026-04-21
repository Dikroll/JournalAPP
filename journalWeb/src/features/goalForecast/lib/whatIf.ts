import type { GradeEntry } from '@/entities/grades'
import type { GradeType } from '@/shared/types'

export interface WhatIfFutureMark {
	type: GradeType
	value: number
	repeat: number
}

function currentMarks(entries: GradeEntry[]): number[] {
	return entries
		.filter(e => e.marks !== null)
		.flatMap(e =>
			Object.values(e.marks!).filter(
				(v): v is number => v !== null && v !== 0,
			),
		)
}

function futureMarks(future: WhatIfFutureMark[]): number[] {
	return future.flatMap(m =>
		m.repeat > 0 ? Array(m.repeat).fill(m.value) : [],
	)
}

export function whatIfAverage(
	entries: GradeEntry[],
	future: WhatIfFutureMark[],
): number | null {
	const combined = [...currentMarks(entries), ...futureMarks(future)]
	if (!combined.length) return null
	return combined.reduce((s, v) => s + v, 0) / combined.length
}
