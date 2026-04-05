import type { HomeworkItemWithStatus } from '@/entities/homework'
import { getGradeStyle, STATUS_CONFIG } from '@/entities/homework'
import { getCachedImageUrl } from '@/shared/lib'
import { PhotoViewerModal } from '@/shared/ui'
import { Calendar, Clock, GraduationCap } from 'lucide-react'
import { memo, useState } from 'react'
import { createPortal } from 'react-dom'
import { HomeworkCard } from './HomeworkCard'
import { HomeworkCardActions } from './HomeworkCardActions'

interface Props {
	hw: HomeworkItemWithStatus
}

export const HomeworkCardPhoto = memo(
	function HomeworkCardPhoto({ hw }: Props) {
		const [viewerOpen, setViewerOpen] = useState(false)

		const photoUrl = getCachedImageUrl(hw.photo_url)

		if (!photoUrl) return <HomeworkCard hw={hw} />

		const config = STATUS_CONFIG[hw.statusKey]
		const StatusIcon = config.icon
		const isChecked = hw.statusKey === 'checked'
		const isOverdue = hw.statusKey === 'overdue'

		const grade = isChecked ? hw.grade : null
		const gradeStyle = grade != null ? getGradeStyle(grade) : null

		const cardBg = gradeStyle
			? gradeStyle.bg
			: isOverdue
			? 'bg-overdue-subtle'
			: 'bg-app-surface'

		return (
			<>
				<div
					className={`${cardBg} rounded-[24px] border-4 border-l-4 border-b-4 ${config.borderColor} border-t-0 border-r-0 overflow-hidden`}
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<button
						type='button'
						onClick={() => setViewerOpen(true)}
						className='relative w-full aspect-video bg-app-surface-strong block overflow-hidden focus:outline-none'
					>
						<img
							src={photoUrl}
							alt={hw.theme ?? hw.spec_name}
							className='w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]'
						/>

						<div className='absolute top-3 left-3'>
							<span
								className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.textColor} bg-black/60 backdrop-blur-sm`}
							>
								<StatusIcon size={11} />
								{config.label}
							</span>
						</div>

						{isChecked && grade != null && (
							<div className='absolute top-3 right-3'>
								<div
									className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold border ${
										gradeStyle!.badge
									} bg-black/60 backdrop-blur-sm`}
								>
									{grade}
								</div>
							</div>
						)}
					</button>

					<div className='p-4 space-y-3'>
						<div>
							<h3 className='text-base font-semibold text-app-text leading-snug'>
								{hw.spec_name}
							</h3>
							{hw.theme && (
								<p className='text-sm text-app-muted mt-0.5 line-clamp-1'>
									{hw.theme}
								</p>
							)}
						</div>

						<div className='flex items-center gap-1.5 text-sm text-app-muted'>
							<GraduationCap size={13} className='flex-shrink-0' />
							<span className='truncate'>{hw.teacher}</span>
						</div>

						<div className='flex items-center gap-4'>
							<div className='flex items-center gap-1.5 text-sm text-app-muted'>
								<Calendar size={13} className='flex-shrink-0' />
								<span>{hw.issued_date}</span>
							</div>
							<div
								className={`flex items-center gap-1.5 text-sm font-medium ${
									isOverdue ? 'text-status-overdue' : 'text-app-muted'
								}`}
							>
								<Clock
									size={13}
									className={`flex-shrink-0 ${
										isOverdue ? 'text-status-overdue' : ''
									}`}
								/>
								<span>{hw.deadline}</span>
								{isOverdue && (
									<span className='text-[10px] px-1.5 py-0.5 rounded-full bg-overdue-bg text-status-overdue'>
										просрочено
									</span>
								)}
							</div>
						</div>

						<HomeworkCardActions
							homeworkId={hw.id}
							homeworkTheme={hw.theme ?? hw.spec_name}
							statusKey={hw.statusKey}
							fileUrl={hw.file_url}
							studAnswer={hw.stud_answer}
							studFileUrl={hw.stud_file_url ?? null}
							studId={hw.stud_id ?? null}
						/>
					</div>
				</div>

				{viewerOpen &&
					createPortal(
						<PhotoViewerModal
							src={photoUrl}
							alt={hw.theme ?? hw.spec_name}
							onClose={() => setViewerOpen(false)}
						/>,
						document.body,
					)}
			</>
		)
	},
	(prev, next) =>
		prev.hw.id === next.hw.id &&
		prev.hw.statusKey === next.hw.statusKey &&
		prev.hw.grade === next.hw.grade &&
		prev.hw.photo_url === next.hw.photo_url &&
		prev.hw.stud_answer === next.hw.stud_answer &&
		prev.hw.stud_file_url === next.hw.stud_file_url,
)
