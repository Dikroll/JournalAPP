export interface ChartPoint {
	date: string
	points: number | null
	previous_points: number | null
	has_rasp: boolean | null
}

export interface ChartDataPoint {
	value: number | null
	label: string
}

export interface DashboardActivityEntry {
	date: string
	points: number
	point_type: string
	achievement: string
}
