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
					const isGray = !hasLesson || isWeekend

					return (
						<div
							onClick={() => setSelectedDate(dateStr)}
							className={`
								w-9 h-9 flex items-center justify-center rounded-full text-xs font-semibold
								transition-colors relative cursor-pointer
								${isSelected ? 'bg-brand text-white' : ''}
								${!isSelected && isGray ? 'text-app-faint' : ''}
								${!isSelected && !isGray ? 'text-app-text hover:bg-app-surface-hover' : ''}
							`}
						>
							{day}
							{isToday && !isSelected && (
								<span className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand' />
							)}
						</div>
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
