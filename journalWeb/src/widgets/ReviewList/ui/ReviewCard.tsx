import type { ReviewItem } from '@/entities/review/model/types'
import { formatDate } from '@/shared/utils/dateUtils'

interface Props {
	review: ReviewItem
}

export function ReviewCard({ review }: Props) {
	return (
		<div
			className='bg-white/5 backdrop-blur-xl rounded-[20px] p-4 border border-white/10'
			style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)' }}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<div>
					<p className='text-sm font-semibold text-[#F2F2F2]'>
						{review.teacher}
					</p>
					{review.specs.length > 0 && (
						<p className='text-xs text-[#9CA3AF] mt-0.5'>
							{review.specs.join(', ')}
						</p>
					)}
				</div>
				<span className='shrink-0 text-xs text-[#6B7280]'>
					{formatDate(review.date)}
				</span>
			</div>
			<p className='text-sm text-[#D1D5DB] leading-relaxed'>{review.message}</p>
		</div>
	)
}
