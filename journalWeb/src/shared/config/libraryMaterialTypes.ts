import {
	BookMarked,
	BookOpen,
	FileText,
	FlaskConical,
	Presentation,
	TestTube,
	Video,
} from 'lucide-react'
import React from 'react'

const ICON_SIZE = 14

type IconComponent = React.FC<{ size?: number }>

const ICON_MAP: Record<number, IconComponent> = {
	1: BookOpen,
	2: FileText,
	3: FlaskConical,
	4: BookMarked,
	5: Video,
	6: Presentation,
	7: TestTube,
	8: FileText,
}

export const MATERIAL_TYPE_COLORS: Record<
	number,
	{ border: string; bg: string; text: string }
> = {
	1: {
		border: 'var(--color-new)',
		bg: 'var(--color-new-subtle)',
		text: 'var(--color-new)',
	},
	2: {
		border: 'var(--color-checked)',
		bg: 'var(--color-checked-subtle)',
		text: 'var(--color-checked)',
	},
	3: {
		border: 'var(--color-pending)',
		bg: 'var(--color-pending-subtle)',
		text: 'var(--color-pending)',
	},
	4: {
		border: 'var(--color-comment)',
		bg: 'var(--color-comment-subtle)',
		text: 'var(--color-comment)',
	},
	5: {
		border: 'var(--color-new)',
		bg: 'var(--color-new-subtle)',
		text: 'var(--color-new)',
	},
	6: {
		border: 'var(--color-returned)',
		bg: 'var(--color-returned-subtle)',
		text: 'var(--color-returned)',
	},
	7: {
		border: 'var(--color-overdue)',
		bg: 'var(--color-overdue-bg)',
		text: 'var(--color-overdue)',
	},
	8: {
		border: 'var(--color-pending)',
		bg: 'var(--color-pending-subtle)',
		text: 'var(--color-pending)',
	},
}

/**
 * Получить цвета для типа материала
 */
export function getMaterialTypeColor(typeId: number): {
	border: string
	bg: string
	text: string
} {
	return MATERIAL_TYPE_COLORS[typeId] ?? MATERIAL_TYPE_COLORS[6]
}

/**
 * Получить иконку для типа материала
 */
export function getMaterialTypeIcon(typeId: number): React.ReactNode {
	const IconComponent = ICON_MAP[typeId] ?? FileText
	return React.createElement(IconComponent, { size: ICON_SIZE })
}
