import type {
	HomeworkItemWithStatus,
	HomeworkStatus,
} from '@/entities/homework'
import { STATUS_CONFIG } from '@/entities/homework'
import { ShowMoreBtn } from '@/shared/ui'
import { HomeworkCard } from '@/widgets'

interface Props {
	status: HomeworkStatus
	items: HomeworkItemWithStatus[]
	total: number
	hasMore: boolean
	isLoading?: boolean
	onLoadMore: () => void
}

export function HomeworkStatusSection({
	status,
	items,
	total,
	hasMore,
	isLoading = false,
	onLoadMore,
}: Props) {
	if (items.length === 0) return null

	const { label, icon: Icon, textColor } = STATUS_CONFIG[status]

	return (
		<div>
			<h3 className='text-sm text-app-muted flex items-center gap-1.5 mb-2'>
				<Icon size={13} className={textColor} />
				{label}
				<span className='text-xs'>
					({total}
					{hasMore ? '+' : ''})
				</span>
			</h3>

			<div className='space-y-3'>
				{items.map(hw => (
					<HomeworkCard key={hw.id} hw={hw} />
				))}
			</div>

			{hasMore && (
				<ShowMoreBtn
					onClick={onLoadMore}
					isLoading={isLoading}
					remaining={total - items.length}
				/>
			)}
		</div>
	)
}
