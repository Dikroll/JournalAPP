import { pageConfig } from './pageConfig'
import {
	Home,
	GraduationCap,
	CalendarDays,
	BookOpen,
	Library,
	Star,
	Newspaper,
	Store,
	CreditCard,
	User,
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
]

export const quickLinksNavItems: NavItemConfig[] = [
	{ to: pageConfig.profile, label: 'Профиль', icon: User, exact: true },
	{ to: pageConfig.evaluateLesson, label: 'Оценка занятий', icon: Star, exact: false },
	{ to: pageConfig.news, label: 'Новости', icon: Newspaper, exact: false },
	{ to: pageConfig.market, label: 'Маркет', icon: Store, exact: false },
	{ to: pageConfig.payment, label: 'Платежи', icon: CreditCard, exact: false },
]

export const bottomBarNavItems: NavItemConfig[] = [
	...mainNavItems,
	...studyNavItems,
]
