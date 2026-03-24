import type { ReviewItem } from '@/entities/review'
import { formatDate } from '@/shared/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface Props {
	review: ReviewItem
}

export function ReviewCard({ review }: Props) {
	const [isExpanded, setIsExpanded] = useState(false)

	const MAX_SPECS_COLLAPSED = 1
	const displaySpecs = isExpanded
		? review.specs
		: review.specs.slice(0, MAX_SPECS_COLLAPSED)
	const hasMoreSpecs = review.specs.length > MAX_SPECS_COLLAPSED

	return (
		<div
			className='bg-app-surface backdrop-blur-xl rounded-[20px] p-4 border border-app-border overflow-hidden'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center justify-between gap-2 mb-2'>
				<p className='text-sm font-semibold text-app-text'>{review.teacher}</p>
				<span className='shrink-0 text-xs text-app-muted'>
					{formatDate(review.date)}
				</span>
			</div>
			{review.specs.length > 0 && (
				<div>
					<div className='flex flex-wrap gap-1.5 mb-2 break-words'>
						{displaySpecs.map((spec, index) => (
							<span
								key={`${spec}-${index}`}
								className='inline-block text-xs bg-app-border bg-opacity-50 text-app-muted px-2 py-1 rounded-lg break-words'
							>
								{spec}
							</span>
						))}
					</div>
					{hasMoreSpecs && (
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className='flex items-center gap-1 text-xs text-app-primary hover:text-app-primary/80 transition-colors mb-2'
						>
							{isExpanded
								? 'Свернуть'
								: `+${review.specs.length - MAX_SPECS_COLLAPSED} ещё`}
							<ChevronDown
								size={14}
								className={`transform transition-transform ${
									isExpanded ? 'rotate-180' : ''
								}`}
							/>
						</button>
					)}
				</div>
			)}
			<p className='text-sm text-app-text leading-relaxed'>{review.message}</p>
		</div>
	)
}
