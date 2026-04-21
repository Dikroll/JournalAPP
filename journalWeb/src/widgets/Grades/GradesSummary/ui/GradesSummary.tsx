import type { ChartPoint } from '@/entities/dashboard'
import { GradesCharts } from '@/widgets'
import { memo } from 'react'

interface Props {
	progress: ChartPoint[]
	attendance: ChartPoint[]
}

export const GradesSummary = memo(function GradesSummary({
	progress,
	attendance,
}: Props) {
	return <GradesCharts progress={progress} attendance={attendance} />
})
