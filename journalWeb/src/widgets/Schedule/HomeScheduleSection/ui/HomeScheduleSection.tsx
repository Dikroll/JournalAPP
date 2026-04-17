import { useHomeSchedule } from '@/entities/schedule'
import { IconButton } from '@/shared/ui'
import { formatDateLong } from '@/shared/utils'
import { LessonList, ScheduleList } from '@/widgets'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function HomeScheduleSection() {
	const {
		offset,
		dateStr,
		title,
		otherLessons,
		otherStatus,
		goPrev,
		goNext,
		goToday,
	} = useHomeSchedule()

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
							{title}
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
			) : otherStatus === 'loading' && otherLessons.length === 0 ? (
				<div className='flex flex-col gap-3'>
					{[0, 1, 2].map(i => (
						<div
							key={i}
							className='bg-app-surface rounded-[20px] h-24 animate-pulse border border-app-border'
						/>
					))}
				</div>
			) : otherStatus === 'error' && otherLessons.length === 0 ? (
				<p className='text-status-overdue text-sm text-center py-4'>
					Ошибка загрузки расписания
				</p>
			) : (
				<LessonList lessons={otherLessons} forDate={dateStr} />
			)}
		</>
	)
}
