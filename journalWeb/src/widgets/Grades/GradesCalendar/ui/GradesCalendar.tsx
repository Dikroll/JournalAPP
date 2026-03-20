import type { GradeEntryExpanded } from '@/entities/grades'
import { useMonthNav } from '@/shared/hooks'
import {
	RU_DAYS_SHORT,
	RU_MONTHS,
	getDaysInMonth,
	getFirstDayOfMonth,
	getTodayString,
	toDateString,
} from '@/shared/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

	const yearStr = String(year)
	const monthStr = String(month + 1).padStart(2, '0')
	const currentMonth = `${yearStr}-${monthStr}`

	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfMonth(year, month)
	const datesWithData = byMonth[currentMonth] ?? {}
	const todayStr = getTodayString()

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
			<div
				className='bg-app-surface backdrop-blur-xl rounded-[24px] p-4 border border-app-border'
				style={{ boxShadow: 'var(--shadow-card)' }}
			>
				<div className='flex items-center justify-between mb-4'>
					<button
						type='button'
						onClick={handlePrevMonth}
						className='w-8 h-8 flex items-center justify-center rounded-xl bg-app-surface hover:bg-app-surface-hover text-app-muted transition-colors'
					>
						<ChevronLeft size={16} />
					</button>
					<span className='text-sm font-semibold text-app-text'>
						{RU_MONTHS[month]} {year}
					</span>
					<button
						type='button'
						onClick={handleNextMonth}
						className='w-8 h-8 flex items-center justify-center rounded-xl bg-app-surface hover:bg-app-surface-hover text-app-muted transition-colors'
					>
						<ChevronRight size={16} />
					</button>
				</div>

				<div className='grid grid-cols-7 mb-1'>
					{RU_DAYS_SHORT.map(d => (
						<div
							key={d}
							className='text-center text-[10px] text-app-muted font-medium py-1'
						>
							{d}
						</div>
					))}
				</div>

				<div className='grid grid-cols-7 gap-y-1'>
					{Array.from({ length: firstDay }).map((_, i) => (
						<div key={`empty-${i}`} />
					))}
					{Array.from({ length: daysInMonth }).map((_, i) => {
						const day = i + 1
						const dateStr = toDateString(year, month, day)
						const hasData = !!datesWithData[dateStr]
						const entries = datesWithData[dateStr] ?? []
						const isSelected = selectedDate === dateStr
						const isToday = dateStr === todayStr

						const hasAbsence = entries.some(e => !e.attended)
						const allMarks = entries.flatMap(e => e.flatMarks.map(m => m.value))
						const minMark = allMarks.length ? Math.min(...allMarks) : null

						let dotColor = 'var(--color-new)'
						if (hasAbsence) dotColor = 'var(--color-overdue)'
						else if (minMark != null) {
							if (minMark >= 5) dotColor = 'var(--color-checked)'
							else if (minMark >= 4) dotColor = 'var(--color-new)'
							else if (minMark >= 3) dotColor = 'var(--color-pending)'
							else dotColor = 'var(--color-overdue)'
						}

						return (
							<button
								key={day}
								type='button'
								disabled={!hasData}
								onClick={() => setSelectedDate(isSelected ? null : dateStr)}
								className={`
									relative aspect-square flex flex-col items-center justify-center
									rounded-full text-xs font-semibold transition-colors
									${isSelected ? 'bg-brand text-white' : ''}
									${!isSelected && hasData ? 'text-app-text hover:bg-app-surface-hover' : ''}
									${!isSelected && !hasData ? 'text-app-faint' : ''}
								`}
							>
								<span className='leading-none'>{day}</span>
								{hasData && !isSelected && (
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
					})}
				</div>
			</div>

			{selectedEntries && selectedEntries.length > 0 && (
				<div className='space-y-2'>
					<div className='text-sm font-medium text-app-muted px-1'>
						{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ru-RU', {
							day: 'numeric',
							month: 'long',
							weekday: 'long',
						})}
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
