import { useScheduleMonth } from '@/entities/schedule'
import { useMonthNav } from '@/shared/hooks'
import { MonthGrid } from '@/shared/ui'
import { formatDateLong, getTodayString, toDateString } from '@/shared/utils'
import { useState } from 'react'
import { LessonList } from '../../ScheduleList/ui/LessonList'

export function ScheduleCalendar() {
	const { year, month, prevMonth, nextMonth } = useMonthNav()
	const [selectedDate, setSelectedDate] = useState<string>(getTodayString())

	const dateFilter = toDateString(year, month, 1)
	const { lessons } = useScheduleMonth(dateFilter)

	const daysWithLessons = new Set(lessons.map(l => l.date))
	const selectedLessons = lessons.filter(l => l.date === selectedDate)

	return (
		<div className='flex flex-col gap-4'>
			<MonthGrid
				year={year}
				month={month}
				onPrevMonth={prevMonth}
				onNextMonth={nextMonth}
				renderDay={({ dateStr, day, isToday }) => {
					const dow = new Date(`${dateStr}T00:00:00`).getDay()
					const isWeekend = dow === 0 || dow === 6
					const hasLesson = daysWithLessons.has(dateStr)
					const isSelected = dateStr === selectedDate
					const isActive = hasLesson && !isWeekend

					return (
						<button
							type='button'
							disabled={!isActive}
							onClick={() => setSelectedDate(dateStr)}
							className={`
								relative flex items-center justify-center
								rounded-full text-xs font-semibold transition-colors
								disabled:cursor-default
								${isSelected ? 'bg-brand text-white' : ''}
								${
									!isSelected && isActive
										? 'text-app-text hover:bg-app-surface-hover cursor-pointer'
										: ''
								}
								${!isSelected && !isActive ? 'text-app-faint' : ''}
							`}
							style={{ width: 36, height: 36 }}
						>
							{day}

							{isToday && !isSelected && (
								<span
									className='absolute inset-0 rounded-full pointer-events-none'
									style={{ boxShadow: '0 0 0 1.5px var(--color-brand)' }}
								/>
							)}
						</button>
					)
				}}
			/>

			{selectedDate && (
				<div>
					<p className='text-xs text-app-muted mb-2 px-1 capitalize'>
						{formatDateLong(selectedDate)}
					</p>
					<LessonList lessons={selectedLessons} forDate={selectedDate} />
				</div>
			)}
		</div>
	)
}
