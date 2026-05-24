import {
	GoalsSummaryCard,
	FutureExams,
	HomeScheduleSection,
	HomeworkCountersBar,
	Leaderboard,
	ReviewsList,
} from '@/widgets'
import { useHomework } from '@/entities/homework'
import { useUser } from '@/entities/user'
import { BookOpen } from 'lucide-react'

/**
 * WebHomePage — десктопная версия главной страницы.
 * Используется только внутри WebLayout (ширина >= 768px).
 *
 * Макет:
 * ┌───────────────────┬──────────────────┐
 * │ GoalsSummaryCard  │ HomeSchedule     │
 * ├───────────────────┼──────────────────┤
 * │ FutureExams       │ HomeworkCounters │
 * └───────────────────┴──────────────────┘
 */
export function WebHomePage() {
	const user = useUser()
	const {
		counters,
		filterStatus,
		setFilter,
	} = useHomework()

	return (
		<div className='p-5 h-full flex flex-col'>
			<div className='flex flex-col gap-5 flex-1 min-h-0'>

				{/* ВЕРХНИЙ РЯД (Сводка+Экзамены и Расписание+ДЗ) */}
				<div className='grid grid-cols-2 gap-5 flex-1 min-h-0'>
					
					{/* Левая часть верхнего ряда */}
					<div className='flex flex-col gap-5 min-w-0 h-full'>
						<GoalsSummaryCard />

						{/* Будущие экзамены */}
						<div
							className='rounded-[20px] border border-app-border p-4 flex-1 flex flex-col min-h-0'
							style={{
								background: 'var(--color-surface)',
								boxShadow: 'var(--shadow-card)',
							}}
						>
							<div className='flex items-center gap-2 mb-4'>
								<div className='w-[2px] self-stretch bg-app-border rounded-full' />
								<h2 className='text-base font-bold text-app-text'>
									Будущие экзамены
								</h2>
							</div>
							<FutureExams />
						</div>
					</div>

					{/* Правая часть верхнего ряда */}
					<div className='flex gap-5 items-stretch min-w-0 h-full min-h-0'>
						{/* Расписание */}
						<div
							className='rounded-[20px] border border-app-border p-4 flex-1 flex flex-col min-w-0'
							style={{
								background: 'var(--color-surface)',
								boxShadow: 'var(--shadow-card)',
							}}
						>
							<HomeScheduleSection />
						</div>

						{/* Домашние задания */}
						<div
							className='rounded-[20px] border border-app-border p-4 shrink-0 w-[240px] flex flex-col min-h-0'
							style={{
								background: 'var(--color-surface)',
								boxShadow: 'var(--shadow-card)',
							}}
						>
							<div className='flex items-center justify-center gap-2 mb-4 shrink-0'>
								<BookOpen size={16} className='text-app-muted shrink-0' />
								<h2 className='text-sm font-bold text-app-text text-center'>
									Домашка
								</h2>
							</div>
							{counters && (
								<div className='flex flex-col flex-1 min-h-0 overflow-y-auto' style={{ scrollbarWidth: 'thin' }}>
									<HomeworkCountersBar
										counters={counters}
										activeFilter={filterStatus}
										onFilter={setFilter}
										isVertical={true}
										readonly={true}
									/>
								</div>
							)}
						</div>
					</div>

				</div>

				{/* НИЖНИЙ РЯД (Лидеры и Отзывы) */}
				<div className='grid grid-cols-2 gap-5 flex-1 min-h-0'>
					{/* Рейтинг */}
					<div className='flex flex-col h-full min-h-0 min-w-0'>
						{user && <Leaderboard myStudentId={user.student_id} />}
					</div>

					{/* Отзывы */}
					<div className='flex flex-col h-full min-h-0 min-w-0'>
						<ReviewsList />
					</div>
				</div>

			</div>
		</div>
	)
}