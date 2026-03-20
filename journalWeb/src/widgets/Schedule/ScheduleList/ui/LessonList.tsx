import type { LessonItem } from '@/entities/schedule'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
import { getTodayString } from '@/shared/utils'
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

	return (
		<ul className='flex flex-col gap-3'>
			{lessons.map(lesson => (
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
		</ul>
	)
}
