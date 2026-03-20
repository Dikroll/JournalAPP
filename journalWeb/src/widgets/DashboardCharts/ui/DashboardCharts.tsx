import {
	calcTrend,
	lastValue,
	toChartData,
	useDashboardCharts,
} from '@/entities/dashboard'
import { BookOpen, Users } from 'lucide-react'
import { StatsCard } from './StatsCard'

export function DashboardCharts() {
	const { progress, attendance, status } = useDashboardCharts()

	if (status === 'loading') {
		return (
			<div className='grid grid-cols-2 gap-3 pb-4'>
				{[0, 1].map(i => (
					<div
						key={i}
						className='bg-app-surface rounded-[24px] animate-pulse'
						style={{ height: 200 }}
					/>
				))}
			</div>
		)
	}

	if (status === 'error') return null

	return (
		<div className='grid grid-cols-2 gap-3'>
			<StatsCard
				title='Посещаемость'
				value={lastValue(attendance) != null ? `${lastValue(attendance)}%` : '—'}
				trend={calcTrend(attendance)}
				trendLabel='за месяц'
				data={toChartData(attendance)}
				icon={<Users size={16} />}
				color='#3B82F6'
			/>
			<StatsCard
				title='Средний балл'
				value={lastValue(progress) != null ? lastValue(progress)!.toFixed(1) : '—'}
				trend={calcTrend(progress)}
				trendLabel='за месяц'
				data={toChartData(progress)}
				icon={<BookOpen size={16} />}
				color='#F20519'
			/>
		</div>
	)
}