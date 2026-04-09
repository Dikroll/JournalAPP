import { useFutureExams } from '@/entities/exam'
import { illustrations } from '@/shared/config/illustrationsConfig'
import { InlineImage } from '@/shared/ui'
import { formatDate } from '@/shared/utils'
import { CalendarDays } from 'lucide-react'
import { useMemo } from 'react'

export function FutureExams() {
	const { exams, status } = useFutureExams()

	const emptyState = useMemo(
		() => (
			<div className='flex flex-col items-center justify-center'>
				<InlineImage
					src={illustrations.noExams}
					alt='Нет предстоящих экзаменов'
					width={280}
					height={280}
				/>
				<p className='text-app-muted text-sm'>Нет предстоящих экзаменов</p>
			</div>
		),
		[],
	)

	if (status === 'loading' && exams.length === 0)
		return <p className='text-app-muted text-sm'>Загрузка...</p>

	if (status === 'error')
		return <p className='text-status-overdue text-sm'>Ошибка загрузки</p>

	if (exams.length === 0) return emptyState

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
							style={
								exam.days_left !== null && exam.days_left > 7
									? { background: 'var(--color-checked-bg)', border: '1px solid var(--color-checked-border)' }
									: { background: 'var(--color-overdue-bg)', border: '1px solid var(--color-overdue-border)' }
							}
						>
							<CalendarDays
								size={16}
								className={`mb-0.5 ${exam.days_left !== null && exam.days_left > 7 ? 'text-status-checked' : 'text-status-overdue'}`}
							/>
							{exam.days_left !== null && (
								<span className={`text-[10px] font-bold ${exam.days_left > 7 ? 'text-status-checked' : 'text-status-overdue'}`}>
									{exam.days_left}д
								</span>
							)}
						</div>
						<div className='flex flex-col gap-0.5'>
							<div className='font-medium text-sm text-app-text'>
								{exam.spec}
							</div>
							<div className='text-app-muted text-xs'>
								{formatDate(exam.date)}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
