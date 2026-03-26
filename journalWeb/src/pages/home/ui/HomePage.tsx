import { useScheduleStore } from '@/entities/schedule'
import { formatDateLong } from '@/shared/utils'
import { DashboardCharts, FutureExams, ScheduleList } from '@/widgets'

export function HomePage() {
	const today = useScheduleStore(s => s.today)
	const dateStr = today[0]?.date

	return (
		<div className='min-h-screen pb-28'>
			<div className='px-4 pt-2 pb-4'>
				<DashboardCharts />

				<div className='mt-5 mb-3'>
					<h1 className='text-lg font-bold leading-tight text-app-text'>
						Расписание на сегодня
					</h1>
					{dateStr && (
						<p className='text-xs text-app-muted mt-0.5 capitalize'>
							{formatDateLong(dateStr)}
						</p>
					)}
				</div>

				<ScheduleList />

				<div className='mt-5 mb-3'>
					<h1 className='text-lg font-bold leading-tight text-app-text'>Будущие экзамены</h1>
				</div>

				<FutureExams />
			</div>
		</div>
	)
}