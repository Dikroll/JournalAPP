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
				<PageHeader title='Цели' />
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

				<GoalsList
					items={overview}
					onItemPress={id => navigate(`/goals/${id}`)}
				/>
			</div>
		</div>
	)
}
