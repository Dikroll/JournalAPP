import { useFutureExams } from '@/entities/exam'
import { CalendarDays } from 'lucide-react'

export function FutureExams() {
	const { exams, status } = useFutureExams()

	if (status === 'loading' && exams.length === 0)
		return <p className='text-app-muted text-sm'>Загрузка...</p>

	if (status === 'error')
		return <p className='text-status-overdue text-sm'>Ошибка загрузки</p>

	if (exams.length === 0) return null

	return (
		<div>
			<ul className='flex flex-col gap-2'>
				{exams.map(exam => (
					<li
						key={`${exam.date}-${exam.spec}`}
						className='bg-app-surface rounded-2xl backdrop-blur-sm p-3 flex items-center gap-3'
					>
						<div
							className='flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center'
							style={{
								background: 'var(--color-overdue-bg)',
								border: '1px solid var(--color-overdue-border)',
							}}
						>
							<CalendarDays size={16} className='text-status-overdue mb-0.5' />
							{exam.days_left !== null && (
								<span className='text-status-overdue text-[10px] font-bold'>
									{exam.days_left}д
								</span>
							)}
						</div>
						<div className='flex flex-col gap-0.5'>
							<div className='font-medium text-sm text-app-text'>
								{exam.spec}
							</div>
							<div className='text-app-muted text-xs'>
								{new Date(exam.date + 'T00:00:00').toLocaleDateString('ru-RU', {
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
