import {
	getGapBetweenLessons,
	getLessonTimeLabel,
	getScheduleTimeInfo,
	getWeekDays,
	groupLessonsByDate,
	shiftWeek,
	useScheduleWeek,
} from '@/entities/schedule'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
import { pluralizeLessons } from '@/shared/lib'
import { Badge, IconButton } from '@/shared/ui'
import {
	RU_DAYS_SHORT,
	formatDateCompact,
	getTodayString,
} from '@/shared/utils'
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react'
import { useCallback, useState } from 'react'
import { GapIndicator } from '../../ScheduleList/ui/GapIndicator'
import { LessonCard } from '../../ScheduleList/ui/LessonCard'

function formatWeekRange(days: string[]): string {
	if (days.length < 2) return ''
	const first = formatDateCompact(days[0])
	const last = formatDateCompact(days[6])
	return `${first} — ${last}`
}

export function ScheduleWeekView() {
	const today = getTodayString()
	const [anchor, setAnchor] = useState(today)
	const { lessons, status } = useScheduleWeek(anchor)
	const nowMinutes = useCurrentMinutes()
	const weekDays = getWeekDays(anchor)

	const isCurrentWeek = weekDays.includes(today)

	const goPrev = useCallback(() => setAnchor(a => shiftWeek(a, -1)), [])
	const goNext = useCallback(() => setAnchor(a => shiftWeek(a, 1)), [])
	const goToday = useCallback(() => setAnchor(today), [today])

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

	if (status === 'error' && lessons.length === 0) {
		return (
			<p className='text-status-overdue text-sm text-center py-6'>
				Не удалось загрузить расписание на неделю
			</p>
		)
	}

	const byDate = groupLessonsByDate(lessons, weekDays)

	return (
		<div className='flex flex-col gap-5'>
			{/* Week navigation */}
			<div className='flex items-center justify-between'>
				<IconButton
					icon={<ChevronLeft size={18} />}
					onClick={goPrev}
					size='md'
					shape='square'
					variant='surface'
					aria-label='Предыдущая неделя'
				/>

				<button
					type='button'
					onClick={isCurrentWeek ? undefined : goToday}
					className='text-center'
					disabled={isCurrentWeek}
				>
					<p className='text-sm font-semibold text-app-text'>
						{formatWeekRange(weekDays)}
					</p>
					{!isCurrentWeek && (
						<p className='text-[11px] text-brand font-medium mt-0.5'>
							К текущей неделе
						</p>
					)}
				</button>

				<IconButton
					icon={<ChevronRight size={18} />}
					onClick={goNext}
					size='md'
					shape='square'
					variant='surface'
					aria-label='Следующая неделя'
				/>
			</div>

			{weekDays.map((dateStr, idx) => {
				const dayLessons = byDate[dateStr] ?? []
				const isToday = dateStr === today
				const todayTimeInfo = isToday
					? getScheduleTimeInfo(dayLessons, nowMinutes)
					: null
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
					<section
						key={dateStr}
						className={isPast && !isToday ? 'opacity-60' : ''}
					>
						{/* Section header */}
						<div className='flex items-center justify-between mb-2.5 px-1'>
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
									{pluralizeLessons(dayLessons.length)}
								</span>
							) : (
								<span className='text-xs text-app-faint'>Нет пар</span>
							)}
						</div>

						{/* Lessons — flat list */}
						{!isEmpty ? (
							<ul className='flex flex-col gap-3'>
								{dayLessons.map((lesson, i) => (
									<li key={`${lesson.started_at}-${lesson.room}`} className='flex flex-col'>
										{i > 0 && (
											<GapIndicator
												gap={getGapBetweenLessons(dayLessons[i - 1], lesson)}
											/>
										)}
										<LessonCard
											lesson={lesson}
											isCurrent={
												isToday &&
												nowMinutes >= toMinutes(lesson.started_at) &&
												nowMinutes <= toMinutes(lesson.finished_at)
											}
											timeLabel={getLessonTimeLabel(todayTimeInfo, lesson)}
										/>
									</li>
								))}
							</ul>
						) : (
							<p className='text-app-muted text-sm px-1'>Пар нет</p>
						)}
					</section>
				)
			})}
		</div>
	)
}
