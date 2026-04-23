import type { ActivityFilter } from '@/entities/dashboard'
import { useDashboardActivityViewModel } from '@/entities/dashboard'
import { useSwipeBack } from '@/shared/hooks'
import type { Segment } from '@/shared/ui'
import { PageHeader, SegmentedControl } from '@/shared/ui'
import { ActivityIntroCard, ActivityList } from '@/widgets'
import { ArrowLeft, Coins, Diamond, RefreshCw, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FILTERS: Segment<ActivityFilter>[] = [
	{
		key: 'ALL',
		label: 'Все',
		icon: <TrendingUp size={14} />,
	},
	{
		key: 'COIN',
		label: 'Топгемы',
		icon: <Diamond size={14} className='text-[#00D9FF]' />,
	},
	{
		key: 'DIAMOND',
		label: 'Топмани',
		icon: <Coins size={14} className='text-[#FFD700]' />,
	},
]

export function ProfileActivityPage() {
	const navigate = useNavigate()
	const model = useDashboardActivityViewModel()

	useSwipeBack()

	return (
		<div className='pb-6 text-app-text'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<button
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					aria-label='Назад'
				>
					<ArrowLeft size={18} />
				</button>
				<div className='flex-1'>
					<PageHeader title='Изменения баланса' />
				</div>
				<button
					onClick={() => void model.refreshActivity()}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					aria-label='Обновить'
				>
					<RefreshCw
						size={18}
						className={model.isRefreshing ? 'animate-spin' : undefined}
					/>
				</button>
			</div>

			<div className='px-4 space-y-3'>
				<ActivityIntroCard />

				<SegmentedControl
					segments={FILTERS}
					active={model.activeFilter}
					onChange={model.setActiveFilter}
				/>

				<ActivityList
					status={model.status}
					activityCount={model.activityCount}
					viewItems={model.viewItems}
					visibleItems={model.visibleItems}
					visibleCount={model.visibleCount}
					isRefreshing={model.isRefreshing}
					isFilterPending={model.isFilterPending}
					sentinelRef={model.sentinelRef}
				/>
			</div>
		</div>
	)
}
