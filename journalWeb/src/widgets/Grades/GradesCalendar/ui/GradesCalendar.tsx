import type { GradeEntryExpanded } from '@/entities/grades'
import { getGradeDotColor } from '@/entities/grades'
import { useMonthNav } from '@/shared/hooks'
import { MonthGrid } from '@/shared/ui'
import { formatDateWithWeekday, toDateString } from '@/shared/utils'
import { useCallback, useMemo, useState } from 'react'
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

	const handlePrevMonth = useCallback(() => {
		prevMonth()
		setSelectedDate(null)
	}, [prevMonth])

	const handleNextMonth = useCallback(() => {
		nextMonth()
		setSelectedDate(null)
	}, [nextMonth])

	const handleDayClick = useCallback((dateStr: string, hasData: boolean) => {
		if (!hasData) return
		setSelectedDate(prev => (prev === dateStr ? null : dateStr))
	}, [])

	const currentMonth = toDateString(year, month, 1).slice(0, 7)
	const datesWithData = byMonth[currentMonth] ?? {}

	const selectedEntries = useMemo(
		() => (selectedDate ? datesWithData[selectedDate] ?? [] : null),
		[selectedDate, datesWithData],
	)

	const sortedSelectedEntries = useMemo(
		() =>
			selectedEntries
				? [...selectedEntries].sort((a, b) => a.lesson_number - b.lesson_number)
				: null,
		[selectedEntries],
	)

	const renderDay = useCallback(
		({ dateStr, day, isToday }: { dateStr: string; day: number; isToday: boolean }) => {
			const entries = datesWithData[dateStr] ?? []
			const hasData = entries.length > 0
			const isSelected = selectedDate === dateStr
			const dotColor = hasData ? getGradeDotColor(entries) : null

			return (
				<button
					type='button'
					disabled={!hasData}
					onClick={() => handleDayClick(dateStr, hasData)}
					className='relative flex items-center justify-center rounded-full text-xs font-semibold disabled:cursor-default'
					style={{
						width: 36,
						height: 36,
						WebkitTapHighlightColor: 'transparent',
						background: isSelected ? 'var(--color-brand)' : 'transparent',
						color: isSelected
							? '#fff'
							: hasData
							? 'var(--color-text)'
							: 'var(--color-text-faint)',
					}}
				>
					{day}

					{isToday && !isSelected && (
						<span
							className='absolute inset-0 rounded-full pointer-events-none'
							style={{ boxShadow: '0 0 0 1.5px var(--color-brand)' }}
						/>
					)}

					{dotColor && !isSelected && (
						<span
							className='absolute rounded-full pointer-events-none'
							style={{
								width: 4,
								height: 4,
								bottom: 3,
								left: '50%',
								transform: 'translateX(-50%)',
								backgroundColor: dotColor,
							}}
						/>
					)}
				</button>
			)
		},
		[datesWithData, selectedDate, handleDayClick],
	)

	return (
		<div className='space-y-4'>
			<MonthGrid
				year={year}
				month={month}
				onPrevMonth={handlePrevMonth}
				onNextMonth={handleNextMonth}
				renderDay={renderDay}
			/>

			{Object.keys(datesWithData).length === 0 && (
				<p className='text-app-muted text-sm text-center py-2'>
					В этом месяце нет записей
				</p>
			)}

			{selectedDate && sortedSelectedEntries && sortedSelectedEntries.length > 0 && (
				<div className='space-y-2'>
					<div className='text-sm font-medium text-app-muted px-1'>
						{formatDateWithWeekday(selectedDate)}
					</div>
					<div
						className='bg-app-surface backdrop-blur-xl rounded-[24px] p-3 border border-app-border'
						style={{ boxShadow: 'var(--shadow-card)' }}
					>
						{sortedSelectedEntries.map((entry, idx) => (
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

			{selectedDate && (!sortedSelectedEntries || sortedSelectedEntries.length === 0) && (
				<p className='text-app-muted text-sm text-center py-4'>
					Нет записей за этот день
				</p>
			)}
		</div>
	)
}
