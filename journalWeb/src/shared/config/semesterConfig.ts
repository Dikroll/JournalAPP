export const SEMESTER_LENGTH_WEEKS = 18

export function weeksRemainingInSemester(currentWeek: number): number {
	if (currentWeek < 0) return SEMESTER_LENGTH_WEEKS
	return Math.max(0, SEMESTER_LENGTH_WEEKS - currentWeek)
}
