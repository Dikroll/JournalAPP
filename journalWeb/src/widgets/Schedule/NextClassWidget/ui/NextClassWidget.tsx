import { useScheduleToday } from '@/entities/schedule'
import { formatGapMinutes } from '@/entities/schedule/lib/scheduleGaps'
import { getScheduleTimeInfo } from '@/entities/schedule/lib/scheduleTime'
import { useCurrentMinutes } from '@/shared/hooks'
import { Clock, User, MapPin } from 'lucide-react'

export function NextClassWidget() {
	const { today, status } = useScheduleToday()
	const nowMinutes = useCurrentMinutes()

	if (status !== 'success' || today.length === 0) {
		return (
			<div
				className='rounded-[20px] border border-app-border p-3.5 flex flex-col min-h-0 relative overflow-hidden'
				style={{
					background: 'var(--color-surface)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				<div className='flex items-center justify-between mb-2 shrink-0'>
					<h2 className='text-sm font-bold text-app-text flex items-center gap-2'>
						<Clock size={16} className='text-app-muted shrink-0' />
						<span>Следующая пара</span>
					</h2>
				</div>
				<div className='text-app-text font-bold text-lg mb-1'>Пар нет</div>
				<div className='text-sm text-app-muted'>На сегодня пар нет</div>
			</div>
		)
	}

	const sortedToday = [...today].sort((a, b) => a.lesson - b.lesson)
	const timeInfo = getScheduleTimeInfo(sortedToday, nowMinutes)

	let targetLesson = null
	let badgeText = ''
	let titleText = 'Следующая пара'

	if (timeInfo.type === 'in-lesson' && timeInfo.currentLesson) {
		targetLesson = timeInfo.currentLesson
		badgeText = `ост. ${formatGapMinutes(timeInfo.minutesLeft)}`
		titleText = 'Текущая пара'
	} else if (
		(timeInfo.type === 'before-lessons' || timeInfo.type === 'in-gap') &&
		timeInfo.nextLesson
	) {
		targetLesson = timeInfo.nextLesson
		badgeText = `через ${formatGapMinutes(timeInfo.minutesLeft)}`
		titleText = 'Следующая пара'
	}

	if (!targetLesson) {
		return (
			<div
				className='rounded-[20px] border border-app-border p-3.5 flex flex-col min-h-0 relative overflow-hidden'
				style={{
					background: 'var(--color-surface)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				<div className='flex items-center justify-between mb-2 shrink-0'>
					<h2 className='text-sm font-bold text-app-text flex items-center gap-2'>
						<Clock size={16} className='text-app-muted shrink-0' />
						<span>Следующая пара</span>
					</h2>
				</div>
				<div className='text-app-text font-bold text-lg mb-1'>
					Пары закончились
				</div>
				<div className='text-sm text-app-muted'>На сегодня пар больше нет</div>
			</div>
		)
	}

	// Trim seconds from time string
	const startTime = targetLesson.started_at.split(':').slice(0, 2).join(':')
	const endTime = targetLesson.finished_at.split(':').slice(0, 2).join(':')

	return (
		<div
			className='rounded-[20px] border border-app-border p-3 flex flex-col min-h-0 relative overflow-hidden'
			style={{
				background: 'var(--color-surface)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex items-center justify-between mb-2 shrink-0'>
				<h2 className='text-sm font-bold text-app-text flex items-center gap-2'>
					<Clock size={16} className='text-app-muted shrink-0' />
					<span>{titleText}</span>
				</h2>
			</div>

			<div className='text-2xl font-bold text-app-text mb-1'>
				{startTime} – {endTime}
			</div>

			<div className='text-sm font-semibold text-app-text mb-2 line-clamp-2 leading-snug'>
				{targetLesson.subject}
			</div>

			{targetLesson.teacher && (
				<div className='flex items-center gap-1.5 text-app-muted mb-1.5'>
					<User size={12} className='shrink-0' />
					<span className='text-[11px] truncate'>{targetLesson.teacher}</span>
				</div>
			)}

			<div className='text-xs text-app-muted flex items-center justify-between mt-auto pt-1'>
				{targetLesson.room ? (
					<div className='inline-flex items-center gap-1 bg-app-surface border border-app-border rounded-lg px-2 py-0.5'>
						<MapPin size={10} className='text-app-text flex-shrink-0' />
						<span className='text-[10px] text-app-text'>{targetLesson.room}</span>
					</div>
				) : (
					<span />
				)}

				<span
					className='px-2 py-1 rounded-lg text-[11px] font-medium'
					style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
				>
					{badgeText}
				</span>
			</div>
		</div>
	)
}
