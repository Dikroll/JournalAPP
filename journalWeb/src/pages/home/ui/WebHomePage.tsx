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
 * MacBook Air 13" и выше.
 *
 * Макет (3 колонки):
 * ┌──────────────┬────────────────┬──────────────┐
 * │ GoalsSummary │ HomeSchedule   │ Домашка      │
 * ├──────────────┤                └──────────────┘
 * │ FutureExams  │                               │
 * ├──────────────┴───────────────────────────────┤
 * │ Leaderboard          │ Reviews               │
 * └──────────────────────┴───────────────────────┘
 */
export function WebHomePage() {
	const user = useUser()
	const { counters, filterStatus, setFilter } = useHomework()

	return (
		<div className='p-5 pb-8 w-full'>
			{/* ── РЯД 1: Сводка + Расписание + Домашка ── */}
			<div className='grid gap-4' style={{ gridTemplateColumns: '320px 1fr 220px' }}>

				{/* Колонка 1: Сводка оценок + Будущие экзамены */}
				<div className='flex flex-col gap-4'>
					<GoalsSummaryCard />

					<div
						className='rounded-[20px] border border-app-border p-4'
						style={{
							background: 'var(--color-surface)',
							boxShadow: 'var(--shadow-card)',
						}}
					>
						<div className='flex items-center gap-2 mb-3'>
							<div className='w-[2px] h-5 bg-app-border rounded-full' />
							<h2 className='text-sm font-bold text-app-text'>Будущие экзамены</h2>
						</div>
						<FutureExams />
					</div>
				</div>

				{/* Колонка 2: Расписание */}
				<div
					className='rounded-[20px] border border-app-border p-4'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					<HomeScheduleSection />
				</div>

				{/* Колонка 3: Домашние задания */}
				<div
					className='rounded-[20px] border border-app-border p-4'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					<div className='flex items-center gap-2 mb-4'>
						<BookOpen size={15} className='text-app-muted shrink-0' />
						<h2 className='text-sm font-bold text-app-text'>Домашка</h2>
					</div>
					{counters && (
						<HomeworkCountersBar
							counters={counters}
							activeFilter={filterStatus}
							onFilter={setFilter}
							isVertical={true}
							readonly={true}
						/>
					)}
				</div>
			</div>

			{/* ── РЯД 2: Лидеры + Отзывы ── */}
			<div className='grid grid-cols-2 gap-4 mt-4'>
				{/* Лидеры */}
				<div
					className='rounded-[20px] border border-app-border p-4'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					{user && <Leaderboard myStudentId={user.student_id} />}
				</div>

				{/* Отзывы */}
				<div
					className='rounded-[20px] border border-app-border p-4'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					<ReviewsList />
				</div>
			</div>
		</div>
	)
}