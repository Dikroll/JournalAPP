import type { LessonItem } from '@/entities/schedule'
import { Clock, MapPin, User } from 'lucide-react'

interface Props {
	lesson: LessonItem
	isCurrent?: boolean
}

export function LessonCard({ lesson, isCurrent = false }: Props) {
	return (
		<li
			className={`rounded-[20px] px-4 py-3.5 border transition-all ${
				isCurrent
					? 'bg-app-surface-active border-app-border-strong'
					: 'bg-app-surface border-app-border'
			}`}
			style={{
				boxShadow: isCurrent
					? 'var(--shadow-card)'
					: '0 2px 12px 0 rgba(0,0,0,0.2)',
				backdropFilter: 'blur(16px)',
			}}
		>
			<div className='flex items-center gap-3 mb-2.5'>
				<div
					className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
						isCurrent
							? 'bg-brand-subtle border-brand-border'
							: 'bg-app-surface border-app-border'
					}`}
				>
					<span
						className={`text-[11px] font-bold leading-none ${
							isCurrent ? 'text-brand' : 'text-app-muted'
						}`}
					>
						{lesson.lesson}
					</span>
				</div>
				<p
					className='flex-1 font-semibold text-app-text leading-snug text-[13px]'
					style={{
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{lesson.subject}
				</p>
			</div>

			<div className='flex items-center gap-1.5 text-app-muted mb-1 pl-11'>
				<Clock size={10} />
				<span className='text-[11px]'>
					{lesson.started_at} – {lesson.finished_at}
				</span>
			</div>

			<div className='flex items-center gap-1.5 text-app-muted mb-2.5 pl-11'>
				<User size={10} />
				<span className='text-[10px] truncate'>{lesson.teacher}</span>
			</div>

			<div className='pl-11'>
				<div className='inline-flex items-center gap-1 bg-app-surface border border-app-border rounded-lg px-2 py-0.5'>
					<MapPin size={9} className='text-app-text flex-shrink-0' />
					<span className='text-[10px] text-app-text'>{lesson.room}</span>
				</div>
			</div>
		</li>
	)
}
