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

	const lastAtt = lastValue(attendance)
	const lastProg = lastValue(progress)

	return (
		<div className='grid grid-cols-2 gap-3 mb-4'>
			<StatsCard
				title='Посещаемость'
				value={lastAtt != null ? `${lastAtt}%` : '—'}
				trend={calcTrend(attendance)}
				trendSuffix='%'
				trendLabel='за месяц'
				data={toChartData(attendance)}
				icon={<Users size={16} />}
				color='#3B82F6'
			/>
			<StatsCard
				title='Средний балл'
				value={lastProg != null ? lastProg.toFixed(1) : '—'}
				trend={calcTrend(progress)}
				trendLabel='за месяц'
				data={toChartData(progress)}
				icon={<BookOpen size={16} />}
				color='#F20519'
			/>
		</div>
	)
}
