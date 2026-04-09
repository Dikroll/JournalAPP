import type { PendingFeedback } from '@/entities/feedback'
import { getCachedImageUrl } from '@/shared/lib'
import { formatDateCompact } from '@/shared/utils'
import { BookOpen, ChevronRight, User } from 'lucide-react'

interface Props {
	item: PendingFeedback
	onEvaluate: () => void
}

export function PendingFeedbackCard({ item, onEvaluate }: Props) {
	const photoUrl = getCachedImageUrl(item.teacher_photo)

	return (
		<button
			type='button'
			onClick={onEvaluate}
			className='w-full bg-app-surface rounded-[24px] p-4 border border-app-border text-left transition-all active:scale-[0.98]'
			style={{ boxShadow: 'var(--shadow-card)', WebkitTapHighlightColor: 'transparent' }}
		>
			<div className='flex items-center gap-3'>
				{/* Avatar */}
				<div
					className='shrink-0 w-11 h-11 rounded-full overflow-hidden flex items-center justify-center'
					style={{
						background: 'var(--color-surface-strong)',
						border: '1px solid var(--color-border)',
					}}
				>
					{photoUrl ? (
						<img
							src={photoUrl}
							alt={item.teacher}
							className='w-full h-full object-cover'
						/>
					) : (
						<User size={20} className='text-app-muted' />
					)}
				</div>

				{/* Content */}
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-1.5 mb-0.5'>
						<BookOpen size={12} className='text-brand shrink-0' />
						<p className='text-sm font-semibold text-app-text truncate'>
							{item.subject}
						</p>
					</div>
					<p className='text-xs text-app-muted truncate'>{item.teacher}</p>
					<p className='text-[11px] text-app-faint mt-0.5'>
						{formatDateCompact(item.date)}
					</p>
				</div>

				<ChevronRight size={16} className='text-app-faint shrink-0' />
			</div>
		</button>
	)
}
