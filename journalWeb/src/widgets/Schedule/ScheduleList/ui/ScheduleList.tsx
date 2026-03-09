import { useScheduleToday } from '@/entities/schedule/hooks/useScheduleToday'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks/useCurrentTime'
import { LessonCard } from './LessonCard'

export function ScheduleList() {
	const { today, status, error } = useScheduleToday()
	const nowMinutes = useCurrentMinutes()

	if (status === 'loading' && today.length === 0)
		return <p className='text-[#9CA3AF] text-sm'>Загрузка...</p>

	if (status === 'error')
		return <p className='text-[#DC2626] text-sm'>{error}</p>

	if (today.length === 0)
		return <p className='text-[#9CA3AF] text-sm'>Пар сегодня нет</p>

	return (
		<ul className='flex flex-col gap-3 mb-4'>
			{today.map(lesson => (
				<LessonCard
					key={`${lesson.started_at}-${lesson.room}`}
					lesson={lesson}
					isCurrent={
						nowMinutes >= toMinutes(lesson.started_at) &&
						nowMinutes <= toMinutes(lesson.finished_at)
					}
				/>
			))}
		</ul>
	)
}
