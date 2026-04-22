import type {
	ForecastResult,
	GoalCardData,
	Risk,
} from '@/features/goalForecast'

/**
 * Centralized labels and formatting for goal-related data.
 * Eliminates duplication across GoalCard, WhatIfSimulator, GoalHero, and other components.
 */

/**
 * Risk level labels in Russian
 */
export const RISK_LABELS: Record<Risk, string> = {
	safe: 'на курсе',
	watch: 'на грани',
	danger: 'недобор',
	no_goal: 'без цели',
}

/**
 * Goal completion reason labels
 */
export const COMPLETION_LABELS: Record<
	Exclude<GoalCardData['completionReason'], null>,
	string
> = {
	final_mark: 'зачёт получен',
	stale: 'завершён',
}

/**
 * Format a grade value or return empty dash
 * @param value - Grade value to format or null
 * @param decimals - Number of decimal places (default 1)
 */
export function formatGradeOrEmpty(
	value: number | null,
	decimals: number = 1,
): string {
	if (value === null || value === undefined) return '—'
	return value.toFixed(decimals)
}

/**
 * Get risk label for display
 */
export function getRiskLabel(risk: Risk): string {
	return RISK_LABELS[risk] ?? 'неизвестно'
}

/**
 * Get completion reason label for display
 */
export function getCompletionLabel(
	reason: Exclude<GoalCardData['completionReason'], null>,
): string {
	return COMPLETION_LABELS[reason] ?? 'завершён'
}

/**
 * Determine if goal is completed
 */
export function isGoalCompleted(
	data: GoalCardData | ForecastResult,
): data is GoalCardData {
	return 'completed' in data && data.completed
}
