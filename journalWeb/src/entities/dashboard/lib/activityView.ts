import type { DashboardActivityEntry, OperationType } from '../model/types'

export type ActivityFilter = 'ALL' | 'COIN' | 'DIAMOND'

export interface ActivityViewItem {
	key: string
	dateLabel: string
	title: string
	pointsLabel: string
	pointType: string
	pointTypeLabel: string
	accentColor: string
	accentBorder: string
	isSpend: boolean
}

const ACHIEVEMENT_LABELS: Record<string, string> = {
	PAIR_VISIT: 'Посещение пары',
	EVALUATION_LESSON_MARK: 'Оценка занятия',
	HOMETASK_INTIME: 'Домашнее задание сдано вовремя',
	HOMEWORK_INTIME: 'Домашнее задание сдано вовремя',
	ASSESSMENT: 'Оценка',
	ASSESMENT: 'Оценка',
	MARKET_ORDER: 'Покупка в магазине',
	WORK_IN_CLASS: 'Работа в классе',
	SURVEY: 'Опрос',
}

/**
 * Achievements that represent spending/deducting resources
 */
const SPEND_ACHIEVEMENTS = new Set(['MARKET_ORDER'])

/**
 * Determine operation type based on achievement name
 * @param achievement - Achievement/operation name
 * @param operationType - Explicit operation type from API (takes precedence)
 */
export function getOperationType(
	achievement: string,
	operationType?: OperationType,
): OperationType {
	// API-provided type takes precedence
	if (operationType) return operationType
	// Determine based on achievement name
	return SPEND_ACHIEVEMENTS.has(achievement) ? 'spend' : 'earn'
}

const ACHIEVEMENT_WORDS: Record<string, string> = {
	HOMETASK: 'Домашнее задание',
	HOMEWORK: 'Домашнее задание',
	INTIME: 'вовремя',
	IN: 'в',
	TIME: 'срок',
	ASSESSMENT: 'Оценка',
	ASSESMENT: 'Оценка',
	EVALUATION: 'Оценивание',
	LESSON: 'занятие',
	MARK: 'оценка',
	PAIR: 'пара',
	VISIT: 'посещение',
	SURVEY: 'Опрос',
}

export function resolveActivityFilter(value?: string | null): ActivityFilter {
	return value === 'COIN' || value === 'DIAMOND' ? value : 'ALL'
}

export function filterActivityEntries(
	entries: DashboardActivityEntry[],
	filter: ActivityFilter,
) {
	if (filter === 'ALL') return entries
	return entries.filter(entry => entry.point_type === filter)
}

export function buildActivityViewItems(entries: DashboardActivityEntry[]) {
	return entries.map<ActivityViewItem>((entry, index) => {
		const operationType = getOperationType(
			entry.achievement,
			entry.operation_type,
		)
		const isSpend = operationType === 'spend'

		const accentColor =
			entry.point_type === 'COIN'
				? 'rgba(0,217,255,0.16)'
				: entry.point_type === 'DIAMOND'
				? 'rgba(255,215,0,0.18)'
				: 'rgba(34,197,94,0.14)'
		const accentBorder =
			entry.point_type === 'COIN'
				? 'rgba(0,217,255,0.28)'
				: entry.point_type === 'DIAMOND'
				? 'rgba(255,215,0,0.32)'
				: 'rgba(34,197,94,0.24)'

		const pointsPrefix = isSpend ? '−' : '+'

		return {
			key: `${entry.date}-${entry.achievement}-${entry.point_type}-${entry.points}-${index}`,
			dateLabel: formatActivityDate(entry.date),
			title: getAchievementLabel(entry.achievement),
			pointsLabel: `${pointsPrefix}${entry.points.toLocaleString('ru-RU')}`,
			pointType: entry.point_type,
			pointTypeLabel: getPointTypeLabel(entry.point_type),
			accentColor,
			accentBorder,
			isSpend,
		}
	})
}

function formatActivityDate(raw: string) {
	const normalized = raw.includes(' ') ? raw.replace(' ', 'T') : raw
	const date = new Date(normalized)

	if (Number.isNaN(date.getTime())) return raw

	return date.toLocaleString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function getAchievementLabel(achievement: string) {
	if (ACHIEVEMENT_LABELS[achievement]) {
		return ACHIEVEMENT_LABELS[achievement]
	}

	return achievement
		.split('_')
		.filter(Boolean)
		.map(
			word => ACHIEVEMENT_WORDS[word] ?? word[0] + word.slice(1).toLowerCase(),
		)
		.join(' ')
}

function getPointTypeLabel(pointType: string) {
	switch (pointType) {
		case 'COIN':
			return 'Топгемы'
		case 'DIAMOND':
			return 'Топмани'
		default:
			return 'Баллы'
	}
}
