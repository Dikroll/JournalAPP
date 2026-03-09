import { useGradesCharts } from '@/entities/dashboard/hooks/useGradesCharts'
import type { ChartPoint } from '@/entities/dashboard/model/types'
import { CustomTooltip } from '@/shared/components/ui/CustomTooltip'
import { useElementSize } from '@/shared/hooks/useElementSize'
import { useTooltipTimeout } from '@/shared/utils/toollipUtils'
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
					? 'bg-white/10 text-[#9CA3AF]'
					: isPositive
						? 'bg-[#10B981]/10 text-[#10B981]'
						: 'bg-[#EF4444]/10 text-[#EF4444]'
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
	tick: { fill: '#9CA3AF' },
} as const

const tooltipWrapperStyle = {
	outline: 'none',
	border: 'none',
	pointerEvents: 'none' as const,
	overflow: 'visible' as const,
	zIndex: 50,
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
						cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
						isAnimationActive={false}
						wrapperStyle={tooltipWrapperStyle}
					/>
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
						fill='#F29F05'
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
					className='bg-white/5 backdrop-blur-xl rounded-[24px] p-5 border border-white/10'
					style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)' }}
				>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base font-bold text-[#F2F2F2]'>
							Динамика оценок
						</h3>
						{progressTrend != null && <TrendBadge trend={progressTrend} />}
					</div>
					<ProgressChart data={progressData} />
				</div>
			)}
			{attendanceData.length > 0 && (
				<div
					className='bg-white/5 backdrop-blur-xl rounded-[24px] p-5 border border-white/10'
					style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)' }}
				>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base font-bold text-[#F2F2F2]'>
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
