import { useElementSize } from '@/shared/hooks/useElementSize'
import { TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Line, LineChart } from 'recharts'

interface StatsCardProps {
	title: string
	value: string | number
	trend?: number
	trendLabel?: string
	data?: Array<{ value: number }>
	icon?: React.ReactNode
	color?: string
}

export function StatsCard({
	title,
	value,
	trend,
	trendLabel,
	data,
	icon,
	color = '#F20519',
}: StatsCardProps) {
	const { ref, width, height } = useElementSize()
	const hasPositiveTrend = trend !== undefined && trend > 0
	const TrendIcon = hasPositiveTrend ? TrendingUp : TrendingDown

	return (
		<div
			className='bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 flex flex-col overflow-hidden aspect-square'
			style={{ boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.3)' }}
		>
			<div className='flex flex-col p-4 flex-1'>
				<div className='flex items-center justify-between mb-2'>
					<h3 className='text-xs text-[#9CA3AF]'>{title}</h3>
					{icon && <div className='text-[#9CA3AF]'>{icon}</div>}
				</div>
				<div className='text-2xl font-bold text-[#F2F2F2] mb-1'>{value}</div>
				{trend !== undefined && (
					<div className='flex items-center gap-1.5'>
						<div
							className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${
								hasPositiveTrend
									? 'bg-[#10B981]/10 text-[#10B981]'
									: 'bg-[#EF4444]/10 text-[#EF4444]'
							}`}
						>
							<TrendIcon size={11} />
							{hasPositiveTrend ? '+' : ''}
							{trend}%
						</div>
						{trendLabel && (
							<span className='text-[10px] text-[#9CA3AF]'>{trendLabel}</span>
						)}
					</div>
				)}
			</div>

			{data && data.length > 0 && (
				// ref на этот div — получаем его реальную ширину
				<div ref={ref} className='w-full px-6 pb-2' style={{ height: 128 }}>
					{width > 0 && height > 0 && (
						<LineChart
							width={width}
							height={height}
							data={data}
							margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
						>
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
						</LineChart>
					)}
				</div>
			)}
		</div>
	)
}
