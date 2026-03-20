import type { GradeEntryExpanded } from '@/entities/grades'
import { getGradeDotColor } from '@/entities/grades'
import { useMonthNav } from '@/shared/hooks'
import { MonthGrid } from '@/shared/ui'
import { formatDateWithWeekday, toDateString } from '@/shared/utils'
import { useState } from 'react'
import { GradeEntryRow } from '../../GradesList/ui/GradeEntryRow'

interface Props {
	byMonth: Record<string, Record<string, GradeEntryExpanded[]>>
}

export function GradesCalendar({ byMonth }: Props) {
	const months = Object.keys(byMonth).sort()
	const now = new Date()
	const defaultMonth =
		months[months.length - 1] ??
		`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

	const { year, month, prevMonth, nextMonth } = useMonthNav(defaultMonth)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)

	const currentMonth = toDateString(year, month, 1).slice(0, 7)
	const datesWithData = byMonth[currentMonth] ?? {}

	const handlePrevMonth = () => {
		prevMonth()
		setSelectedDate(null)
	}

	const handleNextMonth = () => {
		nextMonth()
		setSelectedDate(null)
	}

	const selectedEntries = selectedDate
		? datesWithData[selectedDate] ?? []
		: null

	return (
		<div className='space-y-4'>
			<MonthGrid
				year={year}
				month={month}
				onPrevMonth={handlePrevMonth}
				onNextMonth={handleNextMonth}
				renderDay={({ dateStr, day, isToday }) => {
					const entries = datesWithData[dateStr] ?? []
					const hasData = entries.length > 0
					const isSelected = selectedDate === dateStr
					const dotColor = hasData ? getGradeDotColor(entries) : null

					return (
						<button
							type='button'
							disabled={!hasData}
							onClick={() => setSelectedDate(isSelected ? null : dateStr)}
							className={`
								relative aspect-square w-full flex flex-col items-center justify-center
								rounded-full text-xs font-semibold transition-colors
								${isSelected ? 'bg-brand text-white' : ''}
								${!isSelected && hasData ? 'text-app-text hover:bg-app-surface-hover' : ''}
								${!isSelected && !hasData ? 'text-app-faint' : ''}
							`}
						>
							<span className='leading-none'>{day}</span>
							{dotColor && !isSelected && (
								<span
									className='mt-0.5 w-1 h-1 rounded-full'
									style={{ backgroundColor: dotColor }}
								/>
							)}
							{isToday && !isSelected && (
								<span className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand' />
							)}
						</button>
					)
				}}
			/>

			{selectedDate &&
				selectedEntries !== null &&
				selectedEntries.length > 0 && (
					<div className='space-y-2'>
						<div className='text-sm font-medium text-app-muted px-1'>
							{formatDateWithWeekday(selectedDate)}
						</div>
						<div
							className='bg-app-surface backdrop-blur-xl rounded-[24px] p-3 border border-app-border'
							style={{ boxShadow: 'var(--shadow-card)' }}
						>
							{[...selectedEntries]
								.sort((a, b) => a.lesson_number - b.lesson_number)
								.map((entry, idx) => (
									<div key={`${entry.spec_id}-${entry.lesson_number}`}>
										{idx > 0 && (
											<div className='border-t border-app-border my-1' />
										)}
										<GradeEntryRow entry={entry} />
									</div>
								))}
						</div>
					</div>
				)}

			{selectedDate && (!selectedEntries || selectedEntries.length === 0) && (
				<p className='text-app-muted text-sm text-center py-4'>
					Нет записей за этот день
				</p>
			)}
		</div>
	)
}
