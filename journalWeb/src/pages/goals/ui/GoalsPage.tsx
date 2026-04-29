import { useDashboardChartsStore } from '@/entities/dashboard'
import { useSubjects } from '@/entities/subject'
import { useGoalsOverview, useOverallSummary } from '@/features/goalForecast'
import { SpecSelector } from '@/features/selectSpec'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { PageHeader } from '@/shared/ui'
import {
	EmptyGoalsState,
	GoalsList,
	GradesCharts,
	OverallGoalSummary,
} from '@/widgets'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GoalsPage() {
	const overview = useGoalsOverview()
	const summary = useOverallSummary()
	const navigate = useNavigate()
	const progress = useDashboardChartsStore(s => s.progress)
	const attendance = useDashboardChartsStore(s => s.attendance)
	const { subjects } = useSubjects()
	const [showCompleted, setShowCompleted] = useState(false)
	const [filterId, setFilterId] = useState<number | null>(null)
	useSwipeBack()

	const subjectsInOverview = useMemo(() => {
		const ids = new Set(overview.map(o => o.specId))
		return subjects.filter(s => ids.has(s.id))
	}, [subjects, overview])

	const filteredOverview = filterId
		? overview.filter(o => o.specId === filterId)
		: overview
	const active = filteredOverview.filter(o => !o.completed)
	const completed = filteredOverview.filter(o => o.completed)

	const hasEntries = overview.length > 0
	const hasGoals = summary.totalSubjectsWithGoals > 0
	const hasCharts = progress.length > 0 || attendance.length > 0

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='px-4 pt-4 pb-2'>
				<div className='flex items-center gap-3'>
					<button
						type='button'
						onClick={() => navigate(-1)}
						className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
						aria-label='Назад'
					>
						<ArrowLeft size={18} />
					</button>
					<PageHeader title='Сводка оценок' />
				</div>
				<div className='mt-5 mb-3 flex items-center justify-between'>
					<div className='w-[2px] self-stretch bg-app-border mr-3 rounded-full' />
					<p className='text-[12px] text-app-muted mt-2 leading-snug'>
						Поставь цель по каждому предмету — покажу прогноз на семестр, риск
						хвоста и как подтянуть до нужной оценки.
					</p>
				</div>
			</div>

			<div className='px-4 space-y-3'>
				{hasEntries && <OverallGoalSummary summary={summary} />}

				{!hasGoals && (
					<EmptyGoalsState
						hasAnyEntries={hasEntries}
						onPressSetup={() => {
							const firstCard = overview[0]
							if (firstCard) navigate(`/goals/${firstCard.specId}`)
						}}
					/>
				)}

				{hasCharts && (
					<GradesCharts progress={progress} attendance={attendance} />
				)}

				{overview.length > 0 && (
					<SpecSelector
						subjects={subjectsInOverview}
						selectedId={filterId}
						onChange={s => setFilterId(s?.id ?? null)}
					/>
				)}

				{active.length > 0 && (
					<div className='text-[13px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
						{filterId ? 'Предмет' : 'Активные предметы'}
					</div>
				)}
				<GoalsList
					items={active}
					onItemPress={id => navigate(`/goals/${id}`)}
				/>

				{completed.length > 0 &&
					(filterId ? (
						<GoalsList
							items={completed}
							onItemPress={id => navigate(`/goals/${id}`)}
						/>
					) : (
						<>
							<button
								type='button'
								onClick={() => setShowCompleted(v => !v)}
								className='w-full flex items-center justify-between px-1 mt-3 mb-2'
							>
								<span className='text-[13px] uppercase tracking-wider text-app-muted'>
									Завершённые · {completed.length}
								</span>
								<ChevronDown
									size={16}
									className='text-app-muted transition-transform'
									style={{
										transform: showCompleted ? 'rotate(180deg)' : 'none',
									}}
								/>
							</button>
							{showCompleted && (
								<GoalsList
									items={completed}
									onItemPress={id => navigate(`/goals/${id}`)}
								/>
							)}
						</>
					))}
			</div>
		</div>
	)
}
