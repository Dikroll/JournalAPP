export { useGoal, useHasAnyGoals } from './hooks/useGoal'
export { useGoalsStore } from './model/store'
export type { Goal, GoalsState } from './model/types'
export {
	formatGradeOrEmpty,
	getCompletionLabel,
	getRiskLabel,
} from './utils/goalLabels'
export {
	gradeColor,
	RISK_BG,
	RISK_COLOR,
} from '@/shared/config'
