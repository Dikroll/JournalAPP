import type {
	GroupData,
	HomeworkStatus,
	HomeworkItemWithStatus as HW,
	SubjectData,
} from '@/entities/homework'
import {
	STATUS_CONFIG,
	STATUS_KEY_MAP,
	useHomeworkStatusFiltering,
} from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { illustrations } from '@/shared/config/illustrationsConfig'
import { EmptyState, ShowMoreBtn } from '@/shared/ui'
import { HomeworkCard } from '../card/HomeworkCard'

interface Props {
	byStatus: Record<HomeworkStatus, GroupData>
	filterStatus: HomeworkStatus | null
	selectedSpec: Subject | null
	subjectData: SubjectData | undefined
	onLoadMore: (statusKey: number) => void
	onLoadMoreForSubject: (specId: number, statusKey: number) => void
}

export function HomeworkStatusView({
	byStatus,
	filterStatus,
	selectedSpec,
	subjectData,
	onLoadMore,
	onLoadMoreForSubject,
}: Props) {
	const { statusesToShow, hasAnyItems, filteredGroups } =
		useHomeworkStatusFiltering(byStatus, filterStatus)

	if (!selectedSpec) {
		if (!hasAnyItems) {
			return (
				<EmptyState
					message='Нет домашних заданий'
					illustration={illustrations.noHomework}
				/>
			)
		}

		return (
			<div className='space-y-6'>
				{filteredGroups.map(({ status: s, group }) => {
					const { label, icon: Icon, textColor } = STATUS_CONFIG[s]
					return (
						<div key={s}>
							<h2 className='text-base font-semibold text-app-text mb-3 flex items-center gap-2'>
								<Icon size={18} className={textColor} />
								{label}
								<span className='text-sm text-app-muted font-normal'>
									({group.total}
									{group.hasMore ? '+' : ''})
								</span>
							</h2>
							<div className='space-y-3'>
								{group.items.map(hw => (
									<HomeworkCard key={hw.id} hw={hw} />
								))}
							</div>
							{group.hasMore && (
								<ShowMoreBtn
									onClick={() => onLoadMore(STATUS_KEY_MAP[s])}
									remaining={group.total - group.items.length}
								/>
							)}
						</div>
					)
				})}
			</div>
		)
	}

	const isLoading = !subjectData || subjectData.status === 'loading'

	if (isLoading) {
		return (
			<div className='space-y-3'>
				{[0, 1, 2].map(i => (
					<div
						key={i}
						className='bg-app-surface rounded-[20px] h-24 animate-pulse'
					/>
				))}
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{statusesToShow.map(s => {
				const numKey = STATUS_KEY_MAP[s]
				const storeItems = subjectData.items[numKey] ?? []
				if (!storeItems.length) return null

				const displayItems: HW[] = storeItems.map(hw => ({
					...hw,
					statusKey: s,
				}))
				const total = subjectData.counters?.[s] ?? displayItems.length
				const hasMore =
					!subjectData.expandedStatuses.has(numKey) &&
					displayItems.length < total
				const { label, icon: Icon, textColor } = STATUS_CONFIG[s]

				return (
					<div key={s}>
						<h2 className='text-base font-semibold text-app-text mb-3 flex items-center gap-2'>
							<Icon size={18} className={textColor} />
							{label}
							<span className='text-sm text-app-muted font-normal'>
								({total}
								{hasMore ? '+' : ''})
							</span>
						</h2>
						<div className='space-y-3'>
							{displayItems.map(hw => (
								<HomeworkCard key={hw.id} hw={hw as any} />
							))}
						</div>
						{hasMore && (
							<ShowMoreBtn
								onClick={() => onLoadMoreForSubject(selectedSpec.id, numKey)}
								remaining={total - displayItems.length}
							/>
						)}
					</div>
				)
			})}
		</div>
	)
}
