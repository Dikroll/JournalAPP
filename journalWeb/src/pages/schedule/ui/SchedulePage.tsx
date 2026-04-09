import { RefreshScheduleButton } from '@/features/refreshSchedule'
import { PageHeader } from '@/shared/ui'
import { ScheduleCalendar, ScheduleWeekView } from '@/widgets'
import { CalendarDays, LayoutList } from 'lucide-react'
import { useState } from 'react'

type ViewMode = 'calendar' | 'week'

const VIEWS: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
	{ key: 'calendar', label: 'Календарь', icon: <CalendarDays size={13} /> },
	{ key: 'week', label: 'Неделя', icon: <LayoutList size={13} /> },
]

export function SchedulePage() {
	const [view, setView] = useState<ViewMode>('calendar')

	return (
		<div>
			<div className='p-4 space-y-4'>
				<PageHeader title='Расписание' actions={<RefreshScheduleButton />} />

				{/* View toggle */}
				<div className='flex gap-2'>
					{VIEWS.map(({ key, label, icon }) => {
						const isActive = view === key
						return (
							<button
								key={key}
								type='button'
								onClick={() => setView(key)}
								className='flex-1 h-10 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-1.5'
								style={{
									WebkitTapHighlightColor: 'transparent',
									background: isActive
										? 'var(--color-surface-strong)'
										: 'var(--color-surface)',
									border: isActive
										? '1.5px solid var(--color-border-strong)'
										: '1px solid var(--color-border)',
									color: isActive
										? 'var(--color-text)'
										: 'var(--color-text-muted)',
									boxShadow: isActive ? 'var(--shadow-card)' : 'none',
								}}
							>
								{icon}
								{label}
							</button>
						)
					})}
				</div>

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
