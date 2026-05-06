import {
	DashboardCharts,
	FutureExams,
	HomeScheduleSection,
	HomeworkCountersBar,
	HomeworkStatusView,
} from '@/widgets'
import { useHomework, useHomeworkBySubject, useHomeworkGroups } from '@/entities/homework'

/**
 * WebHomePage — десктопная версия главной страницы.
 * Используется только внутри WebLayout (ширина >= 768px).
 *
 * Макет:
 * ┌───────────────────┬──────────────────┐
 * │ DashboardCharts   │ HomeSchedule     │
 * ├───────────────────┼──────────────────┤
 * │ FutureExams       │ HomeworkStatusView │
 * └───────────────────┴──────────────────┘
 */
export function WebHomePage() {
	const {
		items,
		expandedStatuses,
		counters,
		filterStatus,
		loadMore,
		setFilter,
	} = useHomework()
	const { byStatus } = useHomeworkGroups(
		items,
		expandedStatuses,
		counters,
	)
	const { loadMoreForSubject } = useHomeworkBySubject()

	return (
		<div className='p-5 space-y-5'>

			{/* РЯД 1: Графики + Расписание */}
			<div className='grid grid-cols-2 gap-5 items-start'>

				<div className='flex flex-col gap-4'>
					<DashboardCharts />
				</div>

				<div
					className='rounded-[20px] border border-app-border p-4'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					<HomeScheduleSection />
				</div>
			</div>

			{/* РЯД 2: Экзамены + Домашние задания */}
			<div className='grid grid-cols-2 gap-5 items-start'>

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

				{/* Домашние задания */}
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
						<HomeworkCountersBar
							counters={counters}
							activeFilter={filterStatus}
							onFilter={setFilter}
						/>
					)}
					<div className='mt-3'>
						<HomeworkStatusView
							byStatus={byStatus}
							filterStatus={filterStatus}
							selectedSpec={null}
							subjectData={undefined}
							onLoadMore={loadMore}
							onLoadMoreForSubject={loadMoreForSubject}
						/>
					</div>
				</div>

			</div>

		</div>
	)
}