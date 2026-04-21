export type Mark = 1 | 2 | 3 | 4 | 5

export const GRADE_COLOR: Record<Mark, string> = {
	5: '#10B981',
	4: '#3B82F6',
	3: '#F59E0B',
	2: '#F97316',
	1: '#DC2626',
}

export const GRADE_BG: Record<Mark, string> = {
	5: 'rgba(16,185,129,0.20)',
	4: 'rgba(59,130,246,0.20)',
	3: 'rgba(245,158,11,0.20)',
	2: 'rgba(249,115,22,0.20)',
	1: 'rgba(220,38,38,0.20)',
}

export const GRADE_BORDER: Record<Mark, string> = {
	5: 'rgba(16,185,129,0.30)',
	4: 'rgba(59,130,246,0.30)',
	3: 'rgba(245,158,11,0.30)',
	2: 'rgba(249,115,22,0.30)',
	1: 'rgba(220,38,38,0.30)',
}

export const NEUTRAL_COLOR = '#8a94a6'

export function gradeColor(v: number | null): string {
	if (v === null) return NEUTRAL_COLOR
	if (v >= 4.5) return GRADE_COLOR[5]
	if (v >= 3.5) return GRADE_COLOR[4]
	if (v >= 2.5) return GRADE_COLOR[3]
	if (v >= 1.5) return GRADE_COLOR[2]
	return GRADE_COLOR[1]
}

export type Risk = 'safe' | 'watch' | 'danger' | 'no_goal'

export const RISK_COLOR: Record<Risk, string> = {
	safe: GRADE_COLOR[5],
	watch: GRADE_COLOR[3],
	danger: GRADE_COLOR[1],
	no_goal: NEUTRAL_COLOR,
}

export const RISK_BG: Record<Risk, string> = {
	safe: GRADE_BG[5],
	watch: GRADE_BG[3],
	danger: GRADE_BG[1],
	no_goal: 'rgba(138,148,166,0.10)',
}
