import type { HomeworkItemWithStatus } from '@/entities/homework'
import { getGradeStyle, STATUS_CONFIG } from '@/entities/homework'
import { ChevronDown, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { HomeworkCardActions } from './HomeworkCardActions'
import { HomeworkCardDates } from './HomeworkCardDates'
import { HomeworkCardHeader } from './HomeworkCardHeader'

interface Props {
	hw: HomeworkItemWithStatus
}

export function HomeworkCard({ hw }: Props) {
	const [commentOpen, setCommentOpen] = useState(false)

	const config = STATUS_CONFIG[hw.statusKey]
	const isChecked = hw.statusKey === 'checked'
	const isReturned = hw.statusKey === 'returned'
	const isOverdue = hw.statusKey === 'overdue'

	const grade = isChecked ? hw.grade : null
	const gradeStyle = grade != null ? getGradeStyle(grade) : null

	const cardBg = gradeStyle
		? gradeStyle.bg
		: isOverdue
		? 'bg-overdue-subtle'
		: 'bg-app-surface'

	const hasComment = !!hw.comment
	const commentAlwaysVisible = isReturned

	return (
		<div
			className={`${cardBg} backdrop-blur-xl rounded-[24px] p-5 border-4 border-l-4 border-b-4 ${config.borderColor} border-t-0 border-r-0`}
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
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
				studFileUrl={(hw as any).stud_file_url ?? null}
				studId={(hw as any).stud_id ?? null}
			/>
		</div>
	)
}
