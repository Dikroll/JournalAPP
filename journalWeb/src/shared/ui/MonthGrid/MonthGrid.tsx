import {
	getDaysInMonth,
	getFirstDayOfMonth,
	getTodayString,
	RU_DAYS_SHORT,
	RU_MONTHS,
	toDateString,
} from '@/shared/utils/dateUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface MonthGridDayInfo {
	dateStr: string
	day: number
	isToday: boolean
}

interface Props {
	year: number
	month: number
	onPrevMonth: () => void
	onNextMonth: () => void
	renderDay: (info: MonthGridDayInfo) => React.ReactNode
}

const TOTAL_CELLS = 42
const CELL_HEIGHT = 44

export function MonthGrid({
	year,
	month,
	onPrevMonth,
	onNextMonth,
	renderDay,
}: Props) {
	const todayStr = getTodayString()
	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfMonth(year, month)

	const cells: (number | null)[] = Array.from(
		{ length: TOTAL_CELLS },
		(_, i) => {
			const dayIndex = i - firstDay
			if (dayIndex < 0 || dayIndex >= daysInMonth) return null
			return dayIndex + 1
		},
	)

	return (
		<div
			className='bg-app-surface backdrop-blur-xl rounded-[24px] p-4 border border-app-border'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center justify-between mb-4'>
				<button
					type='button'
					onClick={onPrevMonth}
					title='Previous month'
					className='w-8 h-8 flex items-center justify-center rounded-xl bg-app-surface-strong hover:bg-app-surface-hover text-app-muted transition-colors'
				>
					<ChevronLeft size={16} />
				</button>
				<span className='text-sm font-semibold text-app-text'>
					{RU_MONTHS[month]} {year}
				</span>
				<button
					type='button'
					onClick={onNextMonth}
					title='Next month'
					className='w-8 h-8 flex items-center justify-center rounded-xl bg-app-surface-strong hover:bg-app-surface-hover text-app-muted transition-colors'
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

			<div className='grid grid-cols-7' style={{ height: CELL_HEIGHT * 6 }}>
				{cells.map((day, i) =>
					day !== null ? (
						<div
							key={i}
							className='flex items-center justify-center'
							style={{ height: CELL_HEIGHT }}
						>
							{renderDay({
								dateStr: toDateString(year, month, day),
								day,
								isToday: toDateString(year, month, day) === todayStr,
							})}
						</div>
					) : (
						<div key={i} style={{ height: CELL_HEIGHT }} />
					),
				)}
			</div>
		</div>
	)
}
