import type { SubjectStats as SubjectStatsData } from '@/features/goalForecast'
import { AttendanceStat } from './AttendanceStat'
import { ByPeriodStat } from './ByPeriodStat'
import { ByTypeStat } from './ByTypeStat'
import { CountStat } from './CountStat'
import { DistributionStat } from './DistributionStat'

interface Props {
	stats: SubjectStatsData
}

export function SubjectStats({ stats }: Props) {
	return (
		<div>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
				Статистика
			</div>
			<div className='grid grid-cols-2 gap-2 mb-2'>
				<AttendanceStat data={stats.attendance} />
				<CountStat data={stats.total} />
			</div>
			<div className='space-y-2'>
				<DistributionStat data={stats.distribution} />
				<ByTypeStat data={stats.byType} />
				<ByPeriodStat data={stats.byPeriod} />
			</div>
		</div>
	)
}
