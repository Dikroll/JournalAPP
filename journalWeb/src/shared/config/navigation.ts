import { pageConfig } from './pageConfig'
import {
	Home,
	GraduationCap,
	CalendarDays,
	BookOpen,
	Library,
	Star,
	Newspaper,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItemConfig {
	to: string
	label: string
	icon: LucideIcon
	exact?: boolean
}

export const mainNavItems: NavItemConfig[] = [
	{ to: pageConfig.home, label: 'Главная', icon: Home, exact: true },
	{ to: pageConfig.grades, label: 'Оценки', icon: GraduationCap, exact: false },
	{ to: pageConfig.schedule, label: 'Расписание', icon: CalendarDays, exact: false },
	{ to: pageConfig.homework, label: 'Домашние задания', icon: BookOpen, exact: false },
]

export const studyNavItems: NavItemConfig[] = [
	{ to: pageConfig.library, label: 'Библиотека', icon: Library, exact: false },
	// { to: pageConfig.goals, label: 'Цели', icon: Star, exact: false },
]

export const quickLinksNavItems: NavItemConfig[] = [
	{ to: pageConfig.evaluateLesson, label: 'Оценка занятий', icon: Star, exact: false },
	{ to: pageConfig.news, label: 'Новости', icon: Newspaper, exact: false },
]

export const bottomBarNavItems: NavItemConfig[] = [
	...mainNavItems,
	...studyNavItems,
]
