import type { GradeType } from '../model/types'
export const GRADE_TYPE_CONFIG: Record<
	GradeType,
	{ label: string; color: string }
> = {
	homework: {
		label: 'ДЗ',
		color: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30',
	},
	lab: {
		label: 'Лаб',
		color: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30',
	},
	classwork: {
		label: 'КР',
		color: 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30',
	},
	control: {
		label: 'Контроль',
		color: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
	},
	practical: {
		label: 'Практ',
		color: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
	},
	final: {
		label: 'Зачёт',
		color: 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/30',
	},
}

export function getGradeColor(grade: number): string {
	if (grade >= 5) return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
	if (grade >= 4) return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30'
	if (grade >= 3) return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'
	if (grade >= 2) return 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30'
	return 'bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/30'
}
