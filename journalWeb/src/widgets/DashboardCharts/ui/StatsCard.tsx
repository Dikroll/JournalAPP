import { useElementSize } from '@/shared/hooks'
import { CustomTooltip } from '@/shared/ui'
import { useTooltipDismiss } from '@/shared/utils/toollipUtils'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { memo } from 'react'
import { Line, LineChart, Tooltip, XAxis } from 'recharts'

interface StatsCardProps {
	title: string
	value: string | number
	trend?: number
	trendLabel?: string
	trendSuffix?: string
	data?: Array<{ value: number | null; label?: string }>
	icon?: React.ReactNode
	color?: string
}

const tooltipWrapperStyle = {
	outline: 'none',
	border: 'none',
	pointerEvents: 'none' as const,
	overflow: 'visible' as const,
	zIndex: 50,
}

export const StatsCard = memo(function StatsCard({
	title,
	value,
	trend,
	trendLabel,
	trendSuffix,
	data,
	icon,
	color = '#F20519',
}: StatsCardProps) {
	const { ref, width, height } = useElementSize()
	const { active: tooltipActive, handlers: tooltipHandlers } = useTooltipDismiss()

	const isNeutral = trend === 0
	const isPositive = trend !== undefined && trend > 0
	const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

	return (
		<div
			className='bg-app-surface backdrop-blur-xl rounded-[24px] border border-app-border flex flex-col overflow-hidden aspect-square'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex flex-col p-4 flex-1 min-h-0'>
				<div className='flex items-center justify-between mb-2'>
					<h3 className='text-xs text-app-muted'>{title}</h3>
					{icon && <div className='text-app-muted'>{icon}</div>}
				</div>
				<div className='text-2xl font-bold text-app-text mb-1'>{value}</div>
				{trend !== undefined && (
					<div className='flex items-center gap-1.5'>
						<div
							className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${
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
							{trendSuffix ?? ''}
						</div>
						{trendLabel && (
							<span className='text-[10px] text-app-muted'>{trendLabel}</span>
						)}
					</div>
				)}
			</div>

			{data && data.length > 0 && (
				<div
					ref={ref}
					className='w-full flex-1 min-h-0'
					{...tooltipHandlers}
				>
					{width > 0 && height > 0 && (
						<LineChart
							width={width}
							height={height}
							data={data}
							margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
						>
							<XAxis dataKey='label' hide />
							<Line
								type='monotone'
								dataKey='value'
								stroke={color}
								strokeWidth={4}
								dot={false}
								strokeLinecap='round'
								strokeLinejoin='round'
								isAnimationActive={false}
							/>
							{tooltipActive && (
								<Tooltip
									content={<CustomTooltip />}
									cursor={{ stroke: 'var(--color-border-strong)' }}
									wrapperStyle={tooltipWrapperStyle}
								/>
							)}
						</LineChart>
					)}
				</div>
			)}
		</div>
	)
})
