import type { HomeworkItemWithStatus } from '@/entities/homework'
import { getGradeStyle, STATUS_CONFIG } from '@/entities/homework'
import { getCachedImageUrl } from '@/shared/lib'
import { PhotoViewerModal } from '@/shared/ui'
import { ChevronDown, MessageSquare } from 'lucide-react'
import { memo, useState } from 'react'
import { createPortal } from 'react-dom'
import { HomeworkCardActions } from './HomeworkCardActions'
import { HomeworkCardDates } from './HomeworkCardDates'
import { HomeworkCardHeader } from './HomeworkCardHeader'

interface Props {
	hw: HomeworkItemWithStatus
}

export const HomeworkCard = memo(
	function HomeworkCard({ hw }: Props) {
		const [commentOpen, setCommentOpen] = useState(false)
		const [viewerOpen, setViewerOpen] = useState(false)

		const photoUrl = getCachedImageUrl(hw.photo_url)

		const config = STATUS_CONFIG[hw.statusKey]
		const isChecked = hw.statusKey === 'checked'
		const isReturned = hw.statusKey === 'returned'
		const isOverdue = hw.statusKey === 'overdue'

		const grade = isChecked ? hw.grade : null
		const gradeStyle = grade != null ? getGradeStyle(grade) : null

		const cardBg = gradeStyle
			? gradeStyle.bg
			: isOverdue
			? 'bg-app-surface'
			: 'bg-app-surface'

		const hasComment = !!hw.comment
		const commentAlwaysVisible = isReturned

		return (
			<>
				<div
					className={`${cardBg} backdrop-blur-xl rounded-[24px] border-4 border-l-4 border-b-4 ${config.borderColor} border-t-0 border-r-0 overflow-hidden`}
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					{photoUrl && (
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
									{config.icon && <config.icon size={11} />}
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
					)}

					<div className={photoUrl ? 'p-4 space-y-3' : 'p-5'}>
						<HomeworkCardHeader hw={hw} gradeStyle={gradeStyle} grade={grade} />

						<HomeworkCardDates
							issuedDate={hw.issued_date}
							deadline={hw.deadline}
							isOverdue={isOverdue}
							isNew={hw.statusKey === 'new'}
						/>

						{hasComment && (
							<div className='mb-4'>
								{!commentAlwaysVisible && (
									<button
										type='button'
										onClick={() => setCommentOpen(v => !v)}
										className='flex items-center gap-1.5 text-xs text-status-comment hover:opacity-80 transition-opacity mb-2'
									>
										<MessageSquare size={13} />
										<span>Комментарий преподавателя</span>
										<ChevronDown
											size={13}
											className={`transition-transform duration-200 ${
												commentOpen ? 'rotate-180' : ''
											}`}
										/>
									</button>
								)}
								{(commentAlwaysVisible || commentOpen) && (
									<div
										className={`p-3 rounded-2xl border ${
											isReturned
												? 'bg-returned-subtle border-returned-border'
												: 'bg-comment-subtle border-comment-border'
										}`}
									>
										<p className='text-sm text-app-text'>{hw.comment}</p>
									</div>
								)}
							</div>
						)}

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
					photoUrl &&
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
		prev.hw.comment === next.hw.comment &&
		prev.hw.photo_url === next.hw.photo_url &&
		prev.hw.stud_answer === next.hw.stud_answer &&
		prev.hw.stud_file_url === next.hw.stud_file_url,
)
