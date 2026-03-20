import type { GradeEntryExpanded } from '@/entities/grades'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { GradeEntryRow } from './GradeEntryRow'

interface Props {
	byMonth: Record<string, Record<string, GradeEntryExpanded[]>>
}

const RU_MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]
const RU_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
	return (new Date(year, month, 1).getDay() + 6) % 7
}

export function GradesCalendar({ byMonth }: Props) {
	const months = Object.keys(byMonth).sort()
	const now = new Date()
	const defaultMonth =
		months[months.length - 1] ??
		`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

	const [currentMonth, setCurrentMonth] = useState(defaultMonth)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)

	const [yearStr, monthStr] = currentMonth.split('-')
	const year = Number(yearStr)
	const month = Number(monthStr) - 1

	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfMonth(year, month)
	const datesWithData = byMonth[currentMonth] ?? {}

	const prevMonth = () => {
		const d = new Date(year, month - 1, 1)
		setCurrentMonth(
			`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
		)
		setSelectedDate(null)
	}
	const nextMonth = () => {
		const d = new Date(year, month + 1, 1)
		setCurrentMonth(
			`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
		)
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
						onClick={prevMonth}
						className='w-8 h-8 flex items-center justify-center rounded-xl bg-app-surface hover:bg-app-surface-hover text-app-muted transition-colors'
					>
						<ChevronLeft size={16} />
					</button>
					<span className='text-sm font-semibold text-app-text'>
						{RU_MONTHS[month]} {year}
					</span>
					<button
						type='button'
						onClick={nextMonth}
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
						const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(
							2,
							'0',
						)}`
						const hasData = !!datesWithData[dateStr]
						const entries = datesWithData[dateStr] ?? []
						const isSelected = selectedDate === dateStr
						const isToday =
							dateStr ===
							`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
								2,
								'0',
							)}-${String(now.getDate()).padStart(2, '0')}`

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
								className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-colors ${
									isSelected
										? 'bg-comment-subtle text-status-comment'
										: hasData
										? 'hover:bg-app-surface-hover text-app-text'
										: 'text-app-faint'
								} ${
									isToday && !isSelected ? 'ring-1 ring-app-border-strong' : ''
								}`}
							>
								<span
									className={`text-xs font-medium leading-none ${
										isSelected ? 'text-status-comment' : ''
									}`}
								>
									{day}
								</span>
								{hasData && (
									<span
										className='mt-0.5 w-1 h-1 rounded-full'
										style={{ backgroundColor: dotColor }}
									/>
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
