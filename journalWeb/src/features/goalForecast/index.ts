export type { ForecastResult, Risk, Trend } from './lib/forecast'
export { computeForecast, computeRisk, computeTrend, currentAverage } from './lib/forecast'
export type { ByTypeItem, Distribution, PeriodItem, SubjectStats, Totals } from './lib/subjectStats'
export {
	computeAttendance,
	computeByPeriod,
	computeByType,
	computeDistribution,
	computeSubjectStats,
	computeTotals,
} from './lib/subjectStats'
export type { WhatIfFutureMark } from './lib/whatIf'
export { whatIfAverage } from './lib/whatIf'
export type { GoalCardData } from './hooks/useGoalsOverview'
export { useGoalsOverview } from './hooks/useGoalsOverview'
export type { GoalDetailData } from './hooks/useGoalDetail'
export { useGoalDetail } from './hooks/useGoalDetail'
export type { OverallSummary } from './hooks/useOverallSummary'
export { useOverallSummary } from './hooks/useOverallSummary'
