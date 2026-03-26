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
		borderColor:
			'border-l-[color:var(--color-overdue)] border-b-[color:var(--color-overdue)]',
		textColor: 'text-status-overdue',
	},
	new: {
		label: 'Новые',
		icon: Sparkles,
		borderColor:
			'border-l-[color:var(--color-new)] border-b-[color:var(--color-new)]',
		textColor: 'text-status-new',
	},
	pending: {
		label: 'На проверке',
		icon: BookOpen,
		borderColor:
			'border-l-[color:var(--color-pending)] border-b-[color:var(--color-pending)]',
		textColor: 'text-status-pending',
	},
	checked: {
		label: 'Проверенные',
		icon: CheckCircle,
		borderColor:
			'border-l-[color:var(--color-checked)] border-b-[color:var(--color-checked)]',
		textColor: 'text-status-checked',
	},
	returned: {
		label: 'Возвращённые',
		icon: RotateCcw,
		borderColor:
			'border-l-[color:var(--color-returned)] border-b-[color:var(--color-returned)]',
		textColor: 'text-status-returned',
	},
}

export function getGradeStyle(grade: number | null | undefined): {
	bg: string
	badge: string
} {
	if (grade == null) {
		return {
			bg: 'bg-app-surface',
			badge: 'bg-app-surface-strong text-app-muted border-app-border-strong',
		}
	}
	if (grade >= 5) return { bg: 'grade-bg-5', badge: 'grade-badge-5' }
	if (grade >= 4) return { bg: 'grade-bg-4', badge: 'grade-badge-4' }
	if (grade >= 3) return { bg: 'grade-bg-3', badge: 'grade-badge-3' }
	return { bg: 'grade-bg-2', badge: 'grade-badge-2' }
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
