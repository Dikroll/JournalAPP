import { PageHeader } from '@/shared/ui'
import { ScheduleCalendar } from '@/widgets'

export function SchedulePage() {
	return (
		<div>
			<div className='p-4 space-y-4'>
				<PageHeader title='Расписание' />
				<ScheduleCalendar />
			</div>
		</div>
	)
}
