import type { GradeEntryExpanded } from '@/entities/grades'
import { getGradeDotColor } from '@/entities/grades'
import { useMonthNav } from '@/shared/hooks'
import { MonthGrid } from '@/shared/ui'
import { formatDateWithWeekday, toDateString } from '@/shared/utils'
import { useCallback, useRef, useState } from 'react'
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

	const touchStartX = useRef(0)
	const touchStartY = useRef(0)

	const handlePrevMonth = () => {
		prevMonth()
		setSelectedDate(null)
	}

	const handleNextMonth = () => {
		nextMonth()
		setSelectedDate(null)
	}

	const currentMonth = toDateString(year, month, 1).slice(0, 7)
	const datesWithData = byMonth[currentMonth] ?? {}

	const handleDayTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX
		touchStartY.current = e.touches[0].clientY
	}, [])

	const makeHandleDayTap = useCallback(
		(dateStr: string, hasData: boolean) =>
			(e: React.TouchEvent | React.MouseEvent) => {
				if (!hasData) return
				e.preventDefault() // ✅ Предотвращает дефолтное поведение
				if (e.type === 'touchend') {
					const te = e as React.TouchEvent
					const dx = Math.abs(
						te.changedTouches[0].clientX - touchStartX.current,
					)
					const dy = Math.abs(
						te.changedTouches[0].clientY - touchStartY.current,
					)
					if (dx > 8 || dy > 8) return
				}
				setSelectedDate(prev => (prev === dateStr ? null : dateStr))
			},
		[],
	)

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
							onTouchStart={hasData ? handleDayTouchStart : undefined}
							onTouchEnd={makeHandleDayTap(dateStr, hasData)}
							onClick={makeHandleDayTap(dateStr, hasData)}
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
				}}
			/>

			{Object.keys(datesWithData).length === 0 && (
				<p className='text-app-muted text-sm text-center py-2'>
					В этом месяце нет записей
				</p>
			)}

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
