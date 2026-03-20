import type {
	GroupData,
	HomeworkStatus,
	HomeworkItemWithStatus as HW,
	SubjectData,
} from '@/entities/homework'
import {
	STATUS_CONFIG,
	STATUS_KEY_MAP,
	STATUS_ORDER,
} from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { ChevronDown } from 'lucide-react'
import { HomeworkCard } from '../card/HomeworkCard'
import { HomeworkCardPhoto } from '../card/HomeworkCardPhoto'
import type { HomeworkViewMode } from '../shared/HomeworkToggleView'

interface Props {
	byStatus: Record<HomeworkStatus, GroupData>
	filterStatus: HomeworkStatus | null
	selectedSpec: Subject | null
	subjectData: SubjectData | undefined
	viewMode: HomeworkViewMode
	onLoadMore: (statusKey: number) => void
	onLoadMoreForSubject: (specId: number, statusKey: number) => void
}

export function HomeworkStatusView({
	byStatus,
	filterStatus,
	selectedSpec,
	subjectData,
	viewMode,
	onLoadMore,
	onLoadMoreForSubject,
}: Props) {
	const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER
	const CardComponent = viewMode === 'photo' ? HomeworkCardPhoto : HomeworkCard

	if (!selectedSpec) {
		return (
			<div className='space-y-6'>
				{statusesToShow.map(s => {
					const group = byStatus[s]
					if (!group?.items.length) return null
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
									<CardComponent key={hw.id} hw={hw} />
								))}
							</div>
							{group.hasMore && (
								<ShowMoreBtn onClick={() => onLoadMore(STATUS_KEY_MAP[s])} />
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
								<CardComponent key={hw.id} hw={hw as any} />
							))}
						</div>
						{hasMore && (
							<ShowMoreBtn
								onClick={() => onLoadMoreForSubject(selectedSpec.id, numKey)}
							/>
						)}
					</div>
				)
			})}
		</div>
	)
}

function ShowMoreBtn({ onClick }: { onClick: () => void }) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-app-surface hover:bg-app-surface-hover border border-app-border rounded-2xl text-sm text-app-muted hover:text-app-text transition-colors'
		>
			<ChevronDown size={16} />
			Показать ещё
		</button>
	)
}
