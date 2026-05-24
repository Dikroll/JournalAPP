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

/**
 * Type of transaction operation
 * 'earn' - points/resources were added
 * 'spend' - points/resources were spent/deducted
 */
export type OperationType = 'earn' | 'spend'

export interface DashboardActivityEntry {
	date: string
	points: number
	point_type: string
	achievement: string
	operation_type?: OperationType // Optional for backward compatibility
}
