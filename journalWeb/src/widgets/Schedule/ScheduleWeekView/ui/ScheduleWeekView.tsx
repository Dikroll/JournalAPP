import { useScheduleWeek } from '@/entities/schedule'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
import { Badge } from '@/shared/ui'
import {
	RU_DAYS_SHORT,
	formatDateCompact,
	getTodayString,
	toDateString,
} from '@/shared/utils'
import { Coffee } from 'lucide-react'
import { LessonCard } from '../../ScheduleList/ui/LessonCard'

function getWeekDays(anyDateStr: string): string[] {
	const d = new Date(`${anyDateStr}T00:00:00`)
	const dow = d.getDay()
	const monday = new Date(d)
	monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
	return Array.from({ length: 7 }, (_, i) => {
		const day = new Date(monday)
		day.setDate(monday.getDate() + i)
		return toDateString(day.getFullYear(), day.getMonth(), day.getDate())
	})
}

function pluralLessons(n: number) {
	if (n === 1) return '1 пара'
	if (n < 5) return `${n} пары`
	return `${n} пар`
}

export function ScheduleWeekView() {
	const today = getTodayString()
	const { lessons, status } = useScheduleWeek(today)
	const nowMinutes = useCurrentMinutes()
	const weekDays = getWeekDays(today)

	if (status === 'loading' && lessons.length === 0) {
		return (
			<div className='flex flex-col gap-3'>
				{Array.from({ length: 5 }, (_, i) => (
					<div
						key={i}
						className='bg-app-surface rounded-[24px] border border-app-border animate-pulse'
						style={{ height: i === 0 ? 160 : 120 }}
					/>
				))}
			</div>
		)
	}

	if (status === 'error') {
		return (
			<p className='text-status-overdue text-sm text-center py-6'>
				Не удалось загрузить расписание на неделю
			</p>
		)
	}

	const byDate = Object.fromEntries(
		weekDays.map(d => [
			d,
			lessons.filter(l => l.date === d).sort((a, b) => a.lesson - b.lesson),
		]),
	)

	return (
		<div className='flex flex-col gap-3'>
			{weekDays.map((dateStr, idx) => {
				const dayLessons = byDate[dateStr] ?? []
				const isToday = dateStr === today
				const isPast = dateStr < today
				const isWeekend = idx >= 5
				const isEmpty = dayLessons.length === 0

				// Выходной без пар — минимальная разделительная строка
				if (isWeekend && isEmpty) {
					return (
						<div
							key={dateStr}
							className='flex items-center gap-3 px-1 opacity-40'
						>
							<span className='text-xs font-semibold text-app-muted w-6 shrink-0'>
								{RU_DAYS_SHORT[idx]}
							</span>
							<span className='text-xs text-app-muted'>
								{formatDateCompact(dateStr)}
							</span>
							<div className='flex-1 h-px bg-app-border' />
							<Coffee size={11} className='text-app-faint shrink-0' />
						</div>
					)
				}

				return (
					<div
						key={dateStr}
						className={`rounded-[24px] border overflow-hidden ${isPast && !isToday ? 'opacity-60' : ''}`}
						style={{
							background: 'var(--color-surface)',
							borderColor: isToday
								? 'var(--color-brand)'
								: 'var(--color-border)',
							borderWidth: isToday ? '1.5px' : '1px',
							boxShadow: isToday ? 'var(--shadow-card)' : undefined,
						}}
					>
						{/* Card header */}
						<div
							className='flex items-center justify-between px-4 py-3'
							style={{
								borderBottom: isEmpty ? 'none' : '1px solid var(--color-border)',
								background: isToday
									? 'var(--color-brand-subtle)'
									: undefined,
							}}
						>
							<div className='flex items-center gap-2'>
								<span
									className='text-xs font-bold w-6 shrink-0'
									style={{
										color: isToday
											? 'var(--color-brand)'
											: 'var(--color-text-muted)',
									}}
								>
									{RU_DAYS_SHORT[idx]}
								</span>
								<span className='text-sm font-semibold text-app-text'>
									{formatDateCompact(dateStr)}
								</span>
								{isToday && (
									<Badge variant='brand' size='xs'>Сегодня</Badge>
								)}
							</div>
							{!isEmpty ? (
								<span className='text-xs text-app-muted'>
									{pluralLessons(dayLessons.length)}
								</span>
							) : (
								<span className='text-xs text-app-faint'>Нет пар</span>
							)}
						</div>

						{/* Lessons */}
						{!isEmpty && (
							<div className='p-3 flex flex-col gap-2'>
								{dayLessons.map(lesson => (
									<LessonCard
										key={`${lesson.started_at}-${lesson.room}`}
										lesson={lesson}
										isCurrent={
											isToday &&
											nowMinutes >= toMinutes(lesson.started_at) &&
											nowMinutes <= toMinutes(lesson.finished_at)
										}
									/>
								))}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
