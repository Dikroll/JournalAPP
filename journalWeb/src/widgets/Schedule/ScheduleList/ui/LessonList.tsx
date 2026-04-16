import type { LessonItem } from '@/entities/schedule'
import { getGapBetweenLessons } from '@/entities/schedule/lib/scheduleGaps'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
import { getTodayString } from '@/shared/utils'
import { GapIndicator } from './GapIndicator'
import { LessonCard } from './LessonCard'

interface Props {
	lessons: LessonItem[]
	forDate?: string
}

export function LessonList({ lessons, forDate }: Props) {
	const nowMinutes = useCurrentMinutes()
	const todayStr = getTodayString()
	const isToday = !forDate || forDate === todayStr

	if (lessons.length === 0)
		return <p className='text-app-muted text-sm'>Пар нет</p>

	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson)

	return (
		<ul className='flex flex-col gap-3'>
			{sorted.map((lesson, i) => (
				<li key={`${lesson.started_at}-${lesson.room}`} className='flex flex-col'>
					{i > 0 && (
						<GapIndicator
							gap={getGapBetweenLessons(sorted[i - 1], lesson)}
						/>
					)}
					<LessonCard
						lesson={lesson}
						isCurrent={
							isToday &&
							nowMinutes >= toMinutes(lesson.started_at) &&
							nowMinutes <= toMinutes(lesson.finished_at)
						}
					/>
				</li>
			))}
		</ul>
	)
}
