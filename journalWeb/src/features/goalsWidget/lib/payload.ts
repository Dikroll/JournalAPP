import type { GradeEntry } from '@/entities/grades'
import type { Risk } from '@/shared/config'

export interface GoalsWidgetDistribution {
	1: number
	2: number
	3: number
	4: number
	5: number
}

export interface GoalsWidgetSummary {
	risk: Risk
	atRiskCount: number
	totalSubjectsWithGoals: number
	forecast: number | null
	target: number | null
}

export interface GoalsWidgetPayload {
	generatedAt: string
	avg: number | null
	attendance: number | null
	totalMarks: number
	distribution: GoalsWidgetDistribution
	summary: GoalsWidgetSummary
}

export interface BuildGoalsPayloadInput {
	avg: number | null
	attendance: number | null
	gradeEntries: Pick<GradeEntry, 'marks'>[]
	summary: GoalsWidgetSummary
}

function emptyDistribution(): GoalsWidgetDistribution {
	return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
}

export function computeDistribution(
	gradeEntries: Pick<GradeEntry, 'marks'>[],
): GoalsWidgetDistribution {
	const counts = emptyDistribution()
	for (const entry of gradeEntries) {
		if (!entry.marks) continue
		for (const value of Object.values(entry.marks)) {
			if (typeof value === 'number' && value >= 1 && value <= 5) {
				counts[value as 1 | 2 | 3 | 4 | 5] += 1
			}
		}
	}
	return counts
}

export function buildGoalsWidgetPayload(
	input: BuildGoalsPayloadInput,
	now = new Date(),
): GoalsWidgetPayload {
	const distribution = computeDistribution(input.gradeEntries)
	const totalMarks =
		distribution[1] +
		distribution[2] +
		distribution[3] +
		distribution[4] +
		distribution[5]

	const attendanceRounded =
		input.attendance == null ? null : Math.round(input.attendance)
	const avgRounded =
		input.avg == null ? null : Math.round(input.avg * 100) / 100

	return {
		generatedAt: now.toISOString(),
		avg: avgRounded,
		attendance: attendanceRounded,
		totalMarks,
		distribution,
		summary: input.summary,
	}
}
