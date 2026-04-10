import type { ChartPoint } from '@/entities/dashboard'
import { useGradesCharts } from '@/entities/dashboard'
import { useElementSize } from '@/shared/hooks'
import { CustomTooltip } from '@/shared/ui/'
import { useTooltipDismiss } from '@/shared/utils/toollipUtils'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { memo } from 'react'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
	progress: ChartPoint[]
	attendance: ChartPoint[]
}

const TrendBadge = memo(function TrendBadge({
	trend,
	suffix,
}: {
	trend: number
	suffix?: string
}) {
	const isPositive = trend > 0
	const isNeutral = trend === 0
	const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
	return (
		<span
			className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
				isNeutral
					? 'bg-app-surface-strong text-app-muted'
					: isPositive
					? 'bg-[#10B981]/10 text-[#10B981]'
					: 'bg-[#EF4444]/10 text-[#EF4444]'
			}`}
		>
			<TrendIcon size={11} />
			{isPositive ? '+' : ''}
			{trend}
			{suffix ?? ''}
		</span>
	)
})

function NoCursor() {
	return null
}

// Static objects — defined once, never recreated
const axisProps = {
	fontSize: 12,
	tickLine: false,
	axisLine: false,
	tick: { fill: 'var(--color-text-muted)' },
} as const

const tooltipWrapperStyle = {
	outline: 'none',
	border: 'none',
	pointerEvents: 'none' as const,
	overflow: 'visible' as const,
	zIndex: 50,
}

const CHART_HEIGHT = 192

const ProgressChart = memo(function ProgressChart({ data }: { data: any[] }) {
	const { ref, width } = useElementSize()
	const { active: tooltipActive, handlers } = useTooltipDismiss()

	return (
		<div ref={ref} className='w-full' style={{ height: CHART_HEIGHT }} {...handlers}>
			{width > 0 && (
				<LineChart
					width={width}
					height={CHART_HEIGHT}
					data={data}
					margin={{ top: 16, right: 8, left: -8, bottom: 0 }}
					tabIndex={-1}
				>
					<XAxis dataKey='label' {...axisProps} height={24} />
					<YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} {...axisProps} width={30} />
					{tooltipActive && (
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
							isAnimationActive={false}
							wrapperStyle={tooltipWrapperStyle}
						/>
					)}
					<Line
						type='monotone'
						dataKey='value'
						stroke='#F20519'
						strokeWidth={3}
						dot={{ fill: '#F20519', r: 4, strokeWidth: 0 }}
						activeDot={{ r: 6, strokeWidth: 0, fill: '#F20519' }}
						isAnimationActive={false}
					/>
				</LineChart>
			)}
		</div>
	)
})

const AttendanceChart = memo(function AttendanceChart({ data }: { data: any[] }) {
	const { ref, width } = useElementSize()
	const { active: tooltipActive, handlers } = useTooltipDismiss()

	return (
		<div ref={ref} className='w-full' style={{ height: CHART_HEIGHT }} {...handlers}>
			{width > 0 && (
				<BarChart
					width={width}
					height={CHART_HEIGHT}
					data={data}
					margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
					tabIndex={-1}
				>
					<XAxis dataKey='label' {...axisProps} height={24} />
					<YAxis
						domain={[0, 100]}
						ticks={[0, 25, 50, 75, 100]}
						{...axisProps}
						width={36}
					/>
					{tooltipActive && (
						<Tooltip
							content={<CustomTooltip suffix='%' />}
							cursor={<NoCursor />}
							isAnimationActive={false}
							wrapperStyle={tooltipWrapperStyle}
						/>
					)}
					<Bar
						dataKey='value'
						fill='#F0A020'
						radius={[8, 8, 0, 0]}
						isAnimationActive={false}
					/>
				</BarChart>
			)}
		</div>
	)
})

export const GradesCharts = memo(function GradesCharts({ progress, attendance }: Props) {
	const { progressData, attendanceData, progressTrend, attendanceTrend } =
		useGradesCharts(progress, attendance)

	return (
		<div className='space-y-3'>
			{progressData.length > 0 && (
				<div
					className='bg-app-surface backdrop-blur-xl rounded-[24px] p-5 border border-app-border'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base font-bold text-app-text'>Динамика оценок</h3>
						{progressTrend != null && <TrendBadge trend={progressTrend} />}
					</div>
					<ProgressChart data={progressData} />
				</div>
			)}
			{attendanceData.length > 0 && (
				<div
					className='bg-app-surface backdrop-blur-xl rounded-[24px] p-5 border border-app-border'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base font-bold text-app-text'>
							Динамика посещаемости
						</h3>
						{attendanceTrend != null && (
							<TrendBadge trend={attendanceTrend} suffix='%' />
						)}
					</div>
					<AttendanceChart data={attendanceData} />
				</div>
			)}
		</div>
	)
})
