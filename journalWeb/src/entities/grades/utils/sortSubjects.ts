import type { SubjectStats } from '../model/types'

export type SortKey = 'alpha' | 'grade-desc' | 'grade-asc'

export function sortSubjects(
	subjects: SubjectStats[],
	key: SortKey,
): SubjectStats[] {
	const arr = [...subjects]
	if (key === 'alpha')
		return arr.sort((a, b) => a.spec_name.localeCompare(b.spec_name, 'ru'))
	if (key === 'grade-desc')
		return arr.sort((a, b) => b.averageGrade - a.averageGrade)
	if (key === 'grade-asc')
		return arr.sort((a, b) => a.averageGrade - b.averageGrade)
	return arr
}
