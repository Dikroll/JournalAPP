import type { ReviewItem } from '@/entities/review'
import { formatDate } from '@/shared/utils'

interface Props {
	review: ReviewItem
}

export function ReviewCard({ review }: Props) {
	return (
		<div
			className='bg-app-surface backdrop-blur-xl rounded-[20px] p-4 border border-app-border'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<div>
					<p className='text-sm font-semibold text-app-text'>
						{review.teacher}
					</p>
					{review.specs.length > 0 && (
						<p className='text-xs text-app-muted mt-0.5'>
							{review.specs.join(', ')}
						</p>
					)}
				</div>
				<span className='shrink-0 text-xs text-app-muted'>
					{formatDate(review.date)}
				</span>
			</div>
			<p className='text-sm text-app-text leading-relaxed'>{review.message}</p>
		</div>
	)
}
