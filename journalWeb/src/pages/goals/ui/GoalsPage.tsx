import { useGoalsOverview, useOverallSummary } from '@/features/goalForecast'
import { PageHeader } from '@/shared/ui'
import { EmptyGoalsState, GoalsList, OverallGoalSummary } from '@/widgets'
import { useNavigate } from 'react-router-dom'

export function GoalsPage() {
	const overview = useGoalsOverview()
	const summary = useOverallSummary()
	const navigate = useNavigate()

	const hasEntries = overview.length > 0
	const hasGoals = summary.totalSubjectsWithGoals > 0

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4'>
				<PageHeader title='Цели семестра' />
				<p className='text-[12px] text-app-muted mt-1 leading-snug'>
					Поставь цель по каждому предмету — покажу прогноз на семестр, риск
					хвоста и как подтянуть до нужной оценки.
				</p>
			</div>

			<div className='px-4'>
				{hasEntries && <OverallGoalSummary summary={summary} />}

				{!hasGoals && (
					<div className='mb-3'>
						<EmptyGoalsState
							hasAnyEntries={hasEntries}
							onPressSetup={() => {
								const firstCard = overview[0]
								if (firstCard) navigate(`/goals/${firstCard.specId}`)
							}}
						/>
					</div>
				)}

				{overview.length > 0 && (
					<div className='text-[10px] uppercase tracking-wider text-app-muted mt-4 mb-2 px-1'>
						Предметы
					</div>
				)}
				<GoalsList
					items={overview}
					onItemPress={id => navigate(`/goals/${id}`)}
				/>
			</div>
		</div>
	)
}
