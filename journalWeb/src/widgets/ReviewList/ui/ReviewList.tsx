import { useReviews } from '@/entities/review'
import { useExpandableList } from '@/shared/hooks'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { MessageSquare } from 'lucide-react'
import { ReviewCard } from './ReviewCard'

export function ReviewsList() {
	const isDesktop = useIsDesktop()
	const initialShow = isDesktop ? 10 : 3
	const { reviews, status } = useReviews()
	const { visible, expanded, toggleExpanded, canExpand, remaining } =
		useExpandableList(reviews, initialShow)

	if (status === 'loading') {
		return (
			<div className='space-y-3'>
				{[1, 2].map(i => (
					<div
						key={i}
						className='bg-app-surface rounded-[20px] h-24 animate-pulse border border-app-border'
					/>
				))}
			</div>
		)
	}

	if (status === 'error' || reviews.length === 0) return null

	return (
		<div className='flex flex-col h-full'>
			<h3 className='text-app-text text-base font-semibold mb-3 flex items-center gap-2 shrink-0'>
				<MessageSquare size={18} className='text-status-comment' />
				Отзывы преподавателей
			</h3>

			<div className='flex-1 min-h-0 relative'>
				<div className='absolute inset-0 overflow-y-auto pr-1' style={{ scrollbarWidth: 'thin' }}>
					<div className='flex flex-col gap-3 min-h-max'>
						{visible.map(review => (
							<ReviewCard
								key={`${review.date}-${review.teacher}`}
								review={review}
							/>
						))}
						{canExpand && (
							<button
								onClick={e => {
									e.preventDefault()
									toggleExpanded()
								}}
								className='w-full py-3 rounded-[18px] bg-app-surface border border-app-border text-app-muted text-sm font-medium hover:bg-app-surface-hover shrink-0'
							>
								{expanded ? 'Свернуть' : `Показать ещё ${remaining}`}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
