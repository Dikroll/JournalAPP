import {
	GoalsSummaryCard,
	FutureExams,
	HomeScheduleSection,
	HomeworkCountersBar,
} from '@/widgets'
import { useHomework } from '@/entities/homework'

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
	const {
		counters,
		filterStatus,
		setFilter,
	} = useHomework()

	return (
		<div className='p-5'>
			<div className='grid grid-cols-2 gap-5 items-start'>

				{/* ЛЕВАЯ КОЛОНКА: Сводка оценок + Экзамены */}
				<div className='flex flex-col gap-5'>
					<GoalsSummaryCard />

					{/* Будущие экзамены */}
					<div
						className='rounded-[20px] border border-app-border p-4'
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

				{/* ПРАВАЯ КОЛОНКА: Расписание + Домашние задания */}
				<div className='flex flex-col gap-5'>
					<div
						className='rounded-[20px] border border-app-border p-4'
						style={{
							background: 'var(--color-surface)',
							boxShadow: 'var(--shadow-card)',
						}}
					>
						<HomeScheduleSection />
					</div>

					{/* Домашние задания — только счётчики */}
					<div
						className='rounded-[20px] border border-app-border p-4'
						style={{
							background: 'var(--color-surface)',
							boxShadow: 'var(--shadow-card)',
						}}
					>
						<div className='flex items-center gap-2 mb-4'>
							<div className='w-[2px] self-stretch bg-app-border rounded-full' />
							<h2 className='text-base font-bold text-app-text'>
								Домашние задания
							</h2>
						</div>
						{counters && (
							<div className='homework-counters-full'>
								<HomeworkCountersBar
									counters={counters}
									activeFilter={filterStatus}
									onFilter={setFilter}
								/>
							</div>
						)}
					</div>
				</div>

			</div>
		</div>
	)
}