export { useDashboardActivity } from './hooks/useDashboardActivity'
export { useDashboardActivityViewModel } from './hooks/useDashboardActivityViewModel'
export { useDashboardCharts } from './hooks/useDashboardCharts'
export { useGradesCharts } from './hooks/useGradesCharts'
export {
	buildActivityViewItems,
	filterActivityEntries,
	getOperationType,
	resolveActivityFilter,
} from './lib/activityView'
export type { ActivityFilter, ActivityViewItem } from './lib/activityView'
export { useDashboardChartsStore } from './model/store'
export type {
	ChartDataPoint,
	ChartPoint,
	DashboardActivityEntry,
	OperationType,
} from './model/types'
export { calcTrend, lastValue, toChartData } from './utils/chartUtils'
