import { useScheduleToday } from '@/entities/schedule'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
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

	if (status === 'error') {
		return (
			<div className='flex flex-col items-center gap-3 py-4'>
				<p className='text-status-overdue text-sm text-center'>
					{error ?? 'Ошибка загрузки расписания'}
				</p>
			</div>
		)
	}

	if (today.length === 0 && status === 'success') {
		return <p className='text-app-muted text-sm'>Пар сегодня нет</p>
	}

	if (today.length === 0) return null

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
