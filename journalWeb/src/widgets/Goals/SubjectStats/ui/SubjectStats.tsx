import type { SubjectStats as SubjectStatsData } from '@/features/goalForecast'
import { AttendanceStat } from './AttendanceStat'
import { ByTypeStat } from './ByTypeStat'
import { CountStat } from './CountStat'
import { DistributionStat } from './DistributionStat'

interface Props {
	stats: SubjectStatsData
}

export function SubjectStats({ stats }: Props) {
	return (
		<div className='mt-5'>
			<div className='text-[13px] uppercase tracking-wider text-app-muted mb-3 px-1'>
				Статистика
			</div>
			<div className='grid grid-cols-2 gap-3 mb-3'>
				<AttendanceStat data={stats.attendance} />
				<CountStat data={stats.total} />
			</div>
			<div className='space-y-3'>
				<DistributionStat data={stats.distribution} />
				<ByTypeStat data={stats.byType} />
			</div>
		</div>
	)
}
