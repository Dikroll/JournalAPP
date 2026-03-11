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
					? 'bg-white/8 border-white/12 shadow-lg shadow-black/30'
					: 'bg-white/5 border-white/8'
			}`}
			style={{
				boxShadow: isCurrent
					? '0 4px 24px 0 rgba(0,0,0,0.3)'
					: '0 2px 12px 0 rgba(0,0,0,0.2)',
				backdropFilter: 'blur(16px)',
			}}
		>
			<div className='flex items-center gap-3 mb-2.5'>
				<div
					className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
						isCurrent
							? 'bg-[#F20519]/15 border border-[#F20519]/30'
							: 'bg-white/6 border border-white/10'
					}`}
				>
					<span
						className={`text-[11px] font-bold leading-none ${
							isCurrent ? 'text-[#F20519]' : 'text-[#6B7280]'
						}`}
					>
						{lesson.lesson}
					</span>
				</div>
				<p
					className='flex-1 font-semibold text-[#E8E8E8] leading-snug text-[13px]'
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

			<div className='flex items-center gap-1.5 text-[#6B7280] mb-1 pl-11'>
				<Clock size={10} />
				<span className='text-[11px]'>
					{lesson.started_at} – {lesson.finished_at}
				</span>
			</div>

			<div className='flex items-center gap-1.5 text-[#6B7280] mb-2.5 pl-11'>
				<User size={10} />
				<span className='text-[10px] truncate'>{lesson.teacher}</span>
			</div>

			<div className='pl-11'>
				<div className='inline-flex items-center gap-1 bg-white/4 border border-white/8 rounded-lg px-2 py-0.5'>
					<MapPin size={9} className='text-[#f2f2f2] flex-shrink-0' />
					<span className='text-[10px] text-[#f2f2f2]'>{lesson.room}</span>
				</div>
			</div>
		</li>
	)
}
