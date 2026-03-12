import type { ChartPoint } from '@/entities/dashboard'
import { useGradesCharts } from '@/entities/dashboard'
import { useElementSize } from '@/shared/hooks'
import { CustomTooltip } from '@/shared/ui/'
import { useTooltipTimeout } from '@/shared/utils'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
	progress: ChartPoint[]
	attendance: ChartPoint[]
}

function TrendBadge({ trend }: { trend: number }) {
	const isPositive = trend > 0
	const isNeutral = trend === 0
	return (
		<span
			className={`text-xs font-medium px-2 py-0.5 rounded-full ${
				isNeutral
					? 'bg-app-surface-strong text-app-muted'
					: isPositive
					? 'bg-checked-subtle text-status-checked'
					: 'bg-overdue-bg text-status-overdue'
			}`}
		>
			{isPositive ? '+' : ''}
			{trend}%
		</span>
	)
}

function NoCursor() {
	return null
}

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
	transform: 'translateY(-100%) translateY(-12px)',
}

function ProgressChart({ data }: { data: any[] }) {
	const { ref, width } = useElementSize()
	const tooltip = useTooltipTimeout()
	const height = 192
	return (
		<div ref={ref} className='w-full' style={{ height }}>
			{width > 0 && (
				<LineChart
					width={width}
					height={height}
					data={data}
					margin={{ top: 16, right: 8, left: -8, bottom: 0 }}
					tabIndex={-1}
					onMouseMove={tooltip.show}
					onMouseLeave={tooltip.hide}
					onTouchStart={tooltip.show}
					onTouchEnd={tooltip.hide}
				>
					<XAxis dataKey='label' {...axisProps} height={24} />
					<YAxis
						domain={[1, 5]}
						ticks={[1, 2, 3, 4, 5]}
						{...axisProps}
						width={30}
					/>
					<Tooltip
						content={<CustomTooltip visible={tooltip.visible} />}
						cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
						isAnimationActive={false}
						wrapperStyle={tooltipWrapperStyle}
					/>
					<Line
						type='monotone'
						dataKey='value'
						stroke='var(--color-brand)'
						strokeWidth={3}
						dot={{ fill: 'var(--color-brand)', r: 4, strokeWidth: 0 }}
						activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-brand)' }}
						isAnimationActive={false}
					/>
				</LineChart>
			)}
		</div>
	)
}

function AttendanceChart({ data }: { data: any[] }) {
	const { ref, width } = useElementSize()
	const tooltip = useTooltipTimeout()
	const height = 192
	return (
		<div ref={ref} className='w-full' style={{ height }}>
			{width > 0 && (
				<BarChart
					width={width}
					height={height}
					data={data}
					margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
					tabIndex={-1}
					onMouseMove={tooltip.show}
					onMouseLeave={tooltip.hide}
					onTouchStart={tooltip.show}
					onTouchEnd={tooltip.hide}
				>
					<XAxis dataKey='label' {...axisProps} height={24} />
					<YAxis
						domain={[0, 100]}
						ticks={[0, 25, 50, 75, 100]}
						{...axisProps}
						width={36}
					/>
					<Tooltip
						content={<CustomTooltip suffix='%' visible={tooltip.visible} />}
						cursor={<NoCursor />}
						isAnimationActive={false}
						wrapperStyle={tooltipWrapperStyle}
					/>
					<Bar
						dataKey='value'
						fill='var(--color-pending)'
						radius={[8, 8, 0, 0]}
						isAnimationActive={false}
					/>
				</BarChart>
			)}
		</div>
	)
}

export function GradesCharts({ progress, attendance }: Props) {
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
						<h3 className='text-base font-bold text-app-text'>
							Динамика оценок
						</h3>
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
						{attendanceTrend != null && <TrendBadge trend={attendanceTrend} />}
					</div>
					<AttendanceChart data={attendanceData} />
				</div>
			)}
		</div>
	)
}
