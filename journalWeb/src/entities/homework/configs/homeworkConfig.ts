import {
	AlertTriangle,
	BookOpen,
	CheckCircle,
	RotateCcw,
	Sparkles,
} from 'lucide-react'
import type { HomeworkStatus } from '../model/types'

export const STATUS_CONFIG: Record<
	HomeworkStatus,
	{
		label: string
		icon: React.ElementType
		borderColor: string
		textColor: string
	}
> = {
	overdue: {
		label: 'Просроченные',
		icon: AlertTriangle,
		borderColor: 'border-l-[#DC2626] border-b-[#DC2626]',
		textColor: 'text-[#DC2626]',
	},
	new: {
		label: 'Новые',
		icon: Sparkles,
		borderColor: 'border-l-[#3B82F6] border-b-[#3B82F6]',
		textColor: 'text-[#3B82F6]',
	},
	pending: {
		label: 'На проверке',
		icon: BookOpen,
		borderColor: 'border-l-[#F59E0B] border-b-[#F59E0B]',
		textColor: 'text-[#F59E0B]',
	},
	checked: {
		label: 'Проверенные',
		icon: CheckCircle,
		borderColor: 'border-l-[#10B981] border-b-[#10B981]',
		textColor: 'text-[#10B981]',
	},
	returned: {
		label: 'Возвращённые',
		icon: RotateCcw,
		borderColor: 'border-l-[#6B7280] border-b-[#6B7280]',
		textColor: 'text-[#6B7280]',
	},
}

export function getGradeStyle(grade: number | null | undefined): {
	bg: string
	badge: string
} {
	if (grade == null) {
		return {
			bg: 'bg-white/5',
			badge: 'bg-white/10 text-[#9CA3AF] border-white/20',
		}
	}
	if (grade >= 5)
		return {
			bg: 'bg-[#10B981]/8',
			badge: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
		}
	if (grade >= 4)
		return {
			bg: 'bg-[#3B82F6]/8',
			badge: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30',
		}
	if (grade >= 3)
		return {
			bg: 'bg-[#F59E0B]/8',
			badge: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
		}
	if (grade >= 2)
		return {
			bg: 'bg-[#F97316]/8',
			badge: 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30',
		}

	return {
		bg: 'bg-[#DC2626]/8',
		badge: 'bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/30',
	}
}

export const STATUS_ORDER: HomeworkStatus[] = [
	'overdue',
	'new',
	'pending',
	'checked',
	'returned',
]

export const STATUS_KEY_MAP: Record<HomeworkStatus, number> = {
	overdue: 0,
	checked: 1,
	pending: 2,
	new: 3,
	returned: 5,
}

export const STATUS_MAP: Record<number, HomeworkStatus> = Object.fromEntries(
	Object.entries(STATUS_KEY_MAP).map(([status, key]) => [key, status]),
) as Record<number, HomeworkStatus>
