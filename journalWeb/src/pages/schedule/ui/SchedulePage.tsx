import { RefreshScheduleButton } from '@/features/refreshSchedule'
import type { Segment } from '@/shared/ui'
import { PageHeader, SegmentedControl } from '@/shared/ui'
import { ScheduleCalendar, ScheduleWeekView } from '@/widgets'
import { CalendarDays, LayoutList } from 'lucide-react'
import { useState } from 'react'

type ViewMode = 'calendar' | 'week'

const VIEWS: Segment<ViewMode>[] = [
	{ key: 'calendar', label: 'Календарь', icon: <CalendarDays size={13} /> },
	{ key: 'week', label: 'Неделя', icon: <LayoutList size={13} /> },
]

export function SchedulePage() {
	const [view, setView] = useState<ViewMode>('calendar')

	return (
		<div>
			<div className='p-4 space-y-4'>
				<PageHeader title='Расписание' actions={<RefreshScheduleButton />} />

				<SegmentedControl segments={VIEWS} active={view} onChange={setView} />

				{view === 'calendar' && <ScheduleCalendar />}
			</div>

			{view === 'week' && (
				<div className='px-4 pb-28'>
					<ScheduleWeekView />
				</div>
			)}
		</div>
	)
}
