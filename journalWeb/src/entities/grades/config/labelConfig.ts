import type { GradeType } from '../model/types'

export interface GradeTypeStyle {
	label: string
	style: {
		background: string
		color: string
		borderColor: string
	}
}

export const GRADE_TYPE_LONG_LABEL: Record<GradeType, string> = {
	homework: 'Домашняя',
	classwork: 'Классная',
	control: 'Контрольная',
	lab: 'Лабораторная',
	practical: 'Практическая',
	final: 'Зачёт',
}

export const GRADE_TYPE_CONFIG: Record<GradeType, GradeTypeStyle> = {
	homework: {
		label: 'ДЗ',
		style: {
			background: 'rgba(59,130,246,0.15)',
			color: '#3B82F6',
			borderColor: 'rgba(59,130,246,0.35)',
		},
	},
	lab: {
		label: 'Лаб',
		style: {
			background: 'rgba(139,92,246,0.15)',
			color: '#8B5CF6',
			borderColor: 'rgba(139,92,246,0.35)',
		},
	},
	classwork: {
		label: 'КР',
		style: {
			background: 'rgba(6,182,212,0.15)',
			color: '#06B6D4',
			borderColor: 'rgba(6,182,212,0.35)',
		},
	},
	control: {
		label: 'Контроль',
		style: {
			background: 'rgba(245,158,11,0.15)',
			color: '#F59E0B',
			borderColor: 'rgba(245,158,11,0.35)',
		},
	},
	practical: {
		label: 'Практ',
		style: {
			background: 'rgba(16,185,129,0.15)',
			color: '#10B981',
			borderColor: 'rgba(16,185,129,0.35)',
		},
	},
	final: {
		label: 'Зачёт',
		style: {
			background: 'rgba(168,85,247,0.15)',
			color: '#A855F7',
			borderColor: 'rgba(168,85,247,0.35)',
		},
	},
}

export function getGradeStyle(grade: number): {
	background: string
	color: string
	borderColor: string
} {
	if (grade >= 5)
		return {
			background: 'rgba(16,185,129,0.15)',
			color: '#10B981',
			borderColor: 'rgba(16,185,129,0.35)',
		}
	if (grade >= 4)
		return {
			background: 'rgba(59,130,246,0.15)',
			color: '#3B82F6',
			borderColor: 'rgba(59,130,246,0.35)',
		}
	if (grade >= 3)
		return {
			background: 'rgba(245,158,11,0.15)',
			color: '#F59E0B',
			borderColor: 'rgba(245,158,11,0.35)',
		}
	if (grade >= 2)
		return {
			background: 'rgba(249,115,22,0.15)',
			color: '#F97316',
			borderColor: 'rgba(249,115,22,0.35)',
		}
	return {
		background: 'rgba(220,38,38,0.15)',
		color: '#DC2626',
		borderColor: 'rgba(220,38,38,0.35)',
	}
}

/**
 * Стиль кружка оценки в GradesSubjectList.
 * final — всегда фиолетовый независимо от значения.
 * Единственная реализация — дубликат из gradeMark.ts УДАЛЁН.
 */
export function gradeCircleStyle(
	type: GradeType,
	value: number,
): { background: string; color: string; borderColor: string } {
	if (type === 'final') {
		return {
			background: 'rgba(168,85,247,0.15)',
			color: '#A855F7',
			borderColor: 'rgba(168,85,247,0.55)',
		}
	}
	return getGradeStyle(value)
}

export function getGradeColor(grade: number): string {
	if (grade >= 5) return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
	if (grade >= 4) return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30'
	if (grade >= 3) return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'
	if (grade >= 2) return 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30'
	return 'bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/30'
}
