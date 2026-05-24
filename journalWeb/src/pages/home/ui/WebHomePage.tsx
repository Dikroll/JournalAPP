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
 * MacBook Air 13" (1470×956 logical px).
 *
 * Макет (3 колонки):
 * ┌──────────────┬────────────────┬──────────────┐  высота: 480px
 * │ GoalsSummary │ HomeSchedule   │ Домашка      │
 * │ FutureExams  │                │              │
 * ├──────────────┴────────────────┴──────────────┤  высота: 380px
 * │ Leaderboard          │ Reviews               │
 * └──────────────────────┴───────────────────────┘
 */
export function WebHomePage() {
	const user = useUser()
	const { counters, filterStatus, setFilter } = useHomework()

	return (
		<div className='p-5 pb-8 flex flex-col gap-4'>

			{/* ── РЯД 1: Сводка + Расписание + Домашка (480px) ── */}
			<div className='grid gap-4' style={{ gridTemplateColumns: '300px 1fr 210px', height: '480px' }}>

				{/* Колонка 1: Сводка оценок + Будущие экзамены */}
				<div className='flex flex-col gap-4 min-h-0 h-full'>
					<GoalsSummaryCard />

					<div
						className='rounded-[20px] border border-app-border p-4 flex flex-col flex-1 min-h-0'
						style={{
							background: 'var(--color-surface)',
							boxShadow: 'var(--shadow-card)',
						}}
					>
						<div className='flex items-center gap-2 mb-3 shrink-0'>
							<div className='w-[2px] h-5 bg-app-border rounded-full' />
							<h2 className='text-sm font-bold text-app-text'>Будущие экзамены</h2>
						</div>
						{/* FutureExams уже простой div — ок */}
						<div className='overflow-y-auto flex-1 min-h-0' style={{ scrollbarWidth: 'thin' }}>
							<FutureExams />
						</div>
					</div>
				</div>

				{/* Колонка 2: Расписание */}
				<div
					className='rounded-[20px] border border-app-border p-4 flex flex-col h-full min-h-0'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					<HomeScheduleSection />
				</div>

				{/* Колонка 3: Домашние задания (нужна фиксированная высота для isVertical) */}
				<div
					className='rounded-[20px] border border-app-border p-4 flex flex-col h-full min-h-0'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					<div className='flex items-center gap-2 mb-4 shrink-0'>
						<BookOpen size={15} className='text-app-muted shrink-0' />
						<h2 className='text-sm font-bold text-app-text'>Домашка</h2>
					</div>
					{counters && (
						<div className='flex-1 min-h-0 relative'>
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

			{/* ── РЯД 2: Лидеры + Отзывы (380px — нужна фиксированная высота) ── */}
			<div className='grid grid-cols-2 gap-4' style={{ height: '380px' }}>

				{/* Лидеры */}
				<div
					className='rounded-[20px] border border-app-border p-4 flex flex-col h-full min-h-0'
					style={{
						background: 'var(--color-surface)',
						boxShadow: 'var(--shadow-card)',
					}}
				>
					{user && <Leaderboard myStudentId={user.student_id} />}
				</div>

				{/* Отзывы */}
				<div
					className='rounded-[20px] border border-app-border p-4 flex flex-col h-full min-h-0'
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