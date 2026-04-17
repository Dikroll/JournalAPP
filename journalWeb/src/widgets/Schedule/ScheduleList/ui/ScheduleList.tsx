import { useScheduleToday } from '@/entities/schedule'
import {
	formatGapMinutes,
	getGapBetweenLessons,
} from '@/entities/schedule/lib/scheduleGaps'
import { getScheduleTimeInfo } from '@/entities/schedule/lib/scheduleTime'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
import { InlineImage } from '@/shared/ui'
import { GapIndicator } from './GapIndicator'
import { LessonCard } from './LessonCard'

export function ScheduleList() {
	const { today, status, error } = useScheduleToday()
	const nowMinutes = useCurrentMinutes()

	if (status === 'loading' && today.length === 0) {
		return (
			<div className='flex flex-col gap-3'>
				{[0, 1, 2].map(i => (
					<div
						key={i}
						className='bg-app-surface rounded-[20px] h-24 animate-pulse border border-app-border'
					/>
				))}
			</div>
		)
	}

	if (status === 'error' && today.length === 0) {
		return (
			<div className='flex flex-col items-center gap-3 py-4'>
				<p className='text-status-overdue text-sm text-center'>
					{error ?? 'Ошибка загрузки расписания'}
				</p>
			</div>
		)
	}

	if (today.length === 0 && status === 'success') {
		return (
			<div className='flex flex-col items-center gap-3 py-4'>
				<InlineImage
					src='/homework.svg'
					alt='Нет пар'
					width={300}
					height={300}
				/>
				<p className='text-app-muted text-sm text-center'>Пар сегодня нет</p>
			</div>
		)
	}

	if (today.length === 0) return null

	const sorted = [...today].sort((a, b) => a.lesson - b.lesson)
	const timeInfo = getScheduleTimeInfo(sorted, nowMinutes)

	function getTimeLabel(lesson: (typeof sorted)[number]): string | undefined {
		if (
			timeInfo.type === 'in-lesson' &&
			timeInfo.currentLesson?.lesson === lesson.lesson
		) {
			return `ост. ${formatGapMinutes(timeInfo.minutesLeft)}`
		}
		if (
			timeInfo.type === 'before-lessons' &&
			timeInfo.nextLesson?.lesson === lesson.lesson
		) {
			return `через ${formatGapMinutes(timeInfo.minutesLeft)}`
		}
		if (
			timeInfo.type === 'in-gap' &&
			timeInfo.nextLesson?.lesson === lesson.lesson
		) {
			return `через ${formatGapMinutes(timeInfo.minutesLeft)}`
		}
		return undefined
	}

	return (
		<ul className='flex flex-col gap-3 mb-4'>
			{sorted.map((lesson, i) => (
				<li
					key={`${lesson.started_at}-${lesson.room}`}
					className='flex flex-col'
				>
					{i > 0 && (
						<GapIndicator gap={getGapBetweenLessons(sorted[i - 1], lesson)} />
					)}
					<LessonCard
						lesson={lesson}
						isCurrent={
							nowMinutes >= toMinutes(lesson.started_at) &&
							nowMinutes <= toMinutes(lesson.finished_at)
						}
						timeLabel={getTimeLabel(lesson)}
					/>
				</li>
			))}
		</ul>
	)
}
