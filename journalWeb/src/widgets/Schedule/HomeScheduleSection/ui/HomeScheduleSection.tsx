import {
	useScheduleByDate,
	useScheduleToday,
} from '@/entities/schedule'
import { getScheduleTimeInfo } from '@/entities/schedule/lib/scheduleTime'
import { useCurrentMinutes } from '@/shared/hooks'
import { IconButton } from '@/shared/ui'
import { formatDateLong, toDateString } from '@/shared/utils'
import { LessonList, ScheduleList } from '@/widgets'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

function getDateByOffset(offset: number): string {
	const d = new Date()
	d.setDate(d.getDate() + offset)
	return toDateString(d.getFullYear(), d.getMonth(), d.getDate())
}

function getTitle(offset: number): string {
	switch (offset) {
		case -1:
			return 'Расписание на вчера'
		case 0:
			return 'Расписание на сегодня'
		case 1:
			return 'Расписание на завтра'
		default:
			return 'Расписание'
	}
}

export function HomeScheduleSection() {
	const { today, status: todayStatus } = useScheduleToday()
	const nowMinutes = useCurrentMinutes()
	const [offset, setOffset] = useState(0)
	const autoShiftedRef = useRef(false)

	const dateStr = getDateByOffset(offset)
	const { lessons: otherLessons, status: otherStatus } = useScheduleByDate(
		offset !== 0 ? dateStr : null,
	)

	useEffect(() => {
		if (autoShiftedRef.current) return
		if (todayStatus !== 'success') return
		if (today.length === 0) return

		const sorted = [...today].sort((a, b) => a.lesson - b.lesson)
		const timeInfo = getScheduleTimeInfo(sorted, nowMinutes)

		if (timeInfo.type === 'after-lessons') {
			setOffset(1)
			autoShiftedRef.current = true
		}
	}, [todayStatus, today, nowMinutes])

	const goPrev = useCallback(() => setOffset(o => Math.max(o - 1, -1)), [])
	const goNext = useCallback(() => setOffset(o => Math.min(o + 1, 1)), [])
	const goToday = useCallback(() => setOffset(0), [])

	return (
		<>
			<div className='mt-5 mb-3 flex items-center justify-between'>
				{/* ЛЕВАЯ ЧАСТЬ */}
				<button
					type='button'
					onClick={offset !== 0 ? goToday : undefined}
					disabled={offset === 0}
					className='flex items-center flex-1 text-left'
				>
					{/* ЛИНИЯ */}
					<div className='w-[2px] self-stretch bg-app-border mr-3 rounded-full' />

					{/* ТЕКСТ */}
					<div className='flex flex-col justify-center'>
						<h1 className='text-lg font-bold leading-tight text-app-text'>
							{getTitle(offset)}
						</h1>
						<p className='text-xs text-app-muted leading-tight mt-0.5 capitalize'>
							{formatDateLong(dateStr)}
						</p>
					</div>
				</button>

				{/* ПРАВАЯ ЧАСТЬ */}
				<div className='flex items-center gap-2 ml-3'>
					<IconButton
						icon={<ChevronLeft size={18} />}
						onClick={goPrev}
						disabled={offset <= -1}
						size='md'
						shape='square'
						variant='surface'
						aria-label='Предыдущий день'
					/>

					{offset !== 0 && (
						<button
							onClick={goToday}
							className='h-9 px-3 text-xs font-medium rounded-2xl border border-app-border bg-app-surface hover:bg-app-surface/80 transition'
						>
							К сегодня
						</button>
					)}

					<IconButton
						icon={<ChevronRight size={18} />}
						onClick={goNext}
						disabled={offset >= 1}
						size='md'
						shape='square'
						variant='surface'
						aria-label='Следующий день'
					/>
				</div>
			</div>

			{offset === 0 ? (
				<ScheduleList />
			) : (
				<>
					{otherStatus === 'loading' && (
						<div className='flex flex-col gap-3'>
							{[0, 1, 2].map(i => (
								<div
									key={i}
									className='bg-app-surface rounded-[20px] h-24 animate-pulse border border-app-border'
								/>
							))}
						</div>
					)}

					{otherStatus === 'error' && (
						<p className='text-status-overdue text-sm text-center py-4'>
							Ошибка загрузки расписания
						</p>
					)}

					{otherStatus === 'success' && (
						<LessonList lessons={otherLessons} forDate={dateStr} />
					)}
				</>
			)}
		</>
	)
}
