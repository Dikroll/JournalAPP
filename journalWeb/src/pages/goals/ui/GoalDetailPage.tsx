import { useGoal } from '@/entities/goals'
import { useGoalDetail } from '@/features/goalForecast'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { PageHeader } from '@/shared/ui'
import {
	GoalHero,
	RecentMarks,
	SetGoalSheet,
	SubjectStats,
	WhatIfSimulator,
} from '@/widgets'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function GoalDetailPage() {
	const { specId: specIdRaw } = useParams<{ specId: string }>()
	const specId = Number(specIdRaw)
	const navigate = useNavigate()
	const { setTarget, removeTarget } = useGoal(specId)
	const [sheetOpen, setSheetOpen] = useState(false)
	const detail = useGoalDetail(specId)
	useSwipeBack()

	if (!Number.isFinite(specId)) {
		return (
			<div className='min-h-screen text-app-text pb-28'>
				<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
					<button
						type='button'
						onClick={() => navigate('/goals')}
						className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					>
						<ArrowLeft size={18} />
					</button>
					<PageHeader title='Предмет' />
				</div>
				<div className='px-4 text-app-muted text-sm'>
					Неверный идентификатор предмета.
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<button
					type='button'
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
				>
					<ArrowLeft size={18} />
				</button>
				<PageHeader title={detail.specName} />
			</div>

			<div className='px-4'>
				<GoalHero
					forecast={detail.forecast}
					target={detail.target}
					onEdit={() => setSheetOpen(true)}
				/>

				<WhatIfSimulator entries={detail.entries} />

				<SubjectStats stats={detail.stats} />

				<RecentMarks items={detail.recent} />
			</div>

			{sheetOpen && (
				<SetGoalSheet
					onClose={() => setSheetOpen(false)}
					specName={detail.specName}
					initialTarget={detail.target}
					onSave={v => setTarget(v)}
					onRemove={() => removeTarget()}
				/>
			)}
		</div>
	)
}
