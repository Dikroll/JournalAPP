import { useReviews } from '@/entities/review'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { ReviewCard } from './ReviewCard'

const INITIAL_SHOW = 3

export function ReviewsList() {
	const { reviews, status } = useReviews()
	const [expanded, setExpanded] = useState(false)

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

	const visible = expanded ? reviews : reviews.slice(0, INITIAL_SHOW)

	return (
		<div>
			<h3 className='text-app-text text-base font-semibold mb-3 flex items-center gap-2'>
				<MessageSquare size={18} className='text-status-comment' />
				Отзывы преподавателей
			</h3>

			<div className='space-y-3'>
				{visible.map((review, i) => (
					<ReviewCard key={i} review={review} />
				))}
			</div>

			{reviews.length > INITIAL_SHOW && (
				<button
					onClick={() => setExpanded(v => !v)}
					className='mt-3 w-full py-3 rounded-[18px] bg-app-surface border border-app-border text-app-muted text-sm font-medium transition-colors hover:bg-app-surface-hover'
				>
					{expanded
						? 'Свернуть'
						: `Показать ещё ${reviews.length - INITIAL_SHOW}`}
				</button>
			)}
		</div>
	)
}
