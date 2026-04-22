export { useDashboardCharts } from './hooks/useDashboardCharts'
export { useDashboardActivity } from './hooks/useDashboardActivity'
export { useDashboardActivityViewModel } from './hooks/useDashboardActivityViewModel'
export { useGradesCharts } from './hooks/useGradesCharts'
export { useDashboardChartsStore } from './model/store'
export type {
	ChartDataPoint,
	ChartPoint,
	DashboardActivityEntry,
} from './model/types'
export type { ActivityFilter, ActivityViewItem } from './lib/activityView'
export {
	buildActivityViewItems,
	filterActivityEntries,
	resolveActivityFilter,
} from './lib/activityView'
export { calcTrend, lastValue, toChartData } from './utils/chartUtils'
