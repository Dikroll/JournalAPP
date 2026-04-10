import type { FeedbackTag, PendingFeedback } from '@/entities/feedback'
import { FEEDBACK_TAG_LABELS } from '@/shared/config/feedbackTags'
import { BottomSheet, SheetButton, SuccessStateView } from '@/shared/ui'
import { BookOpen, Loader2, User } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEvaluateLesson } from '../hooks/useEvaluateLesson'
import { StarRating } from './StarRating'

interface Props {
	item: PendingFeedback
	tags: FeedbackTag[]
	onClose: () => void
}

function TagPicker({
	tags,
	selected,
	onToggle,
}: {
	tags: FeedbackTag[]
	selected: Set<number>
	onToggle: (id: number) => void
}) {
	return (
		<div className='flex flex-wrap gap-2'>
			{tags.map(tag => {
				const active = selected.has(tag.id)
				return (
					<button
						key={tag.id}
						type='button'
						onClick={() => onToggle(tag.id)}
						className='px-3 py-1.5 rounded-full text-xs font-medium transition-all'
						style={{
							background: active
								? 'var(--color-brand-subtle)'
								: 'var(--color-surface-strong)',
							border: active
								? '1.5px solid var(--color-brand-border)'
								: '1px solid var(--color-border)',
							color: active
								? 'var(--color-brand)'
								: 'var(--color-text-muted)',
						}}
					>
						{FEEDBACK_TAG_LABELS[tag.key] ?? tag.key}
					</button>
				)
			})}
		</div>
	)
}

export function EvaluateLessonSheet({ item, tags, onClose }: Props) {
	const {
		step,
		markLesson,
		setMarkLesson,
		markTeach,
		setMarkTeach,
		tagsLesson,
		toggleLessonTag,
		tagsTeach,
		toggleTeachTag,
		commentLesson,
		setCommentLesson,
		commentTeach,
		setCommentTeach,
		submit,
		goToTeacher,
		goToLesson,
		retryFromTeacher,
		isSubmitting,
	} = useEvaluateLesson(item.key)

	const content = (
		<BottomSheet onBackdropClick={isSubmitting ? undefined : onClose}>
			{/* Header */}
			<div className='mb-4'>
				<p className='text-base font-bold text-app-text'>Оценка занятия</p>
				<p className='text-xs text-app-muted mt-0.5 truncate'>
					{item.subject} &middot; {item.teacher}
				</p>
			</div>

			{step === 'success' && (
				<>
					<SuccessStateView
						title='Спасибо за оценку!'
						subtitle='Ваш отзыв поможет улучшить качество занятий'
					/>
					<div className='mt-2'>
						<SheetButton onClick={onClose}>Закрыть</SheetButton>
					</div>
				</>
			)}

			{step === 'error' && (
				<div className='flex flex-col items-center py-6 gap-3'>
					<p className='text-sm font-semibold text-status-overdue'>
						Не удалось отправить оценку
					</p>
					<p className='text-xs text-app-muted'>Попробуйте ещё раз</p>
					<SheetButton variant='primary' onClick={retryFromTeacher}>
						Повторить
					</SheetButton>
				</div>
			)}

			{step === 'lesson' && (
				<div className='space-y-5'>
					<div>
						<div className='flex items-center gap-2 mb-3'>
							<BookOpen size={14} className='text-brand' />
							<p className='text-sm font-semibold text-app-text'>
								Занятие
							</p>
						</div>
						<StarRating value={markLesson} onChange={setMarkLesson} />
					</div>

					{tags.length > 0 && (
						<div>
							<p className='text-xs text-app-muted mb-2'>Теги (необязательно)</p>
							<TagPicker
								tags={tags}
								selected={tagsLesson}
								onToggle={toggleLessonTag}
							/>
						</div>
					)}

					<div>
						<p className='text-xs text-app-muted mb-2'>
							Комментарий (необязательно)
						</p>
						<textarea
							value={commentLesson}
							onChange={e => setCommentLesson(e.target.value)}
							placeholder='Что понравилось или не понравилось?'
							maxLength={500}
							rows={2}
							className='w-full rounded-2xl px-4 py-3 text-sm text-app-text placeholder:text-app-faint resize-none focus:outline-none'
							style={{
								background: 'var(--color-surface-strong)',
								border: '1px solid var(--color-border)',
							}}
						/>
					</div>

					<SheetButton variant='primary' onClick={goToTeacher} disabled={markLesson === 0}>
						Далее — оценка преподавателя
					</SheetButton>
				</div>
			)}

			{(step === 'teacher' || step === 'submitting') && (
				<div className='space-y-5'>
					<div>
						<div className='flex items-center gap-2 mb-3'>
							<User size={14} className='text-brand' />
							<p className='text-sm font-semibold text-app-text'>
								Преподаватель
							</p>
						</div>
						<StarRating value={markTeach} onChange={isSubmitting ? () => {} : setMarkTeach} />
					</div>

					{tags.length > 0 && (
						<div>
							<p className='text-xs text-app-muted mb-2'>Теги (необязательно)</p>
							<TagPicker
								tags={tags}
								selected={tagsTeach}
								onToggle={isSubmitting ? () => {} : toggleTeachTag}
							/>
						</div>
					)}

					<div>
						<p className='text-xs text-app-muted mb-2'>
							Комментарий (необязательно)
						</p>
						<textarea
							value={commentTeach}
							onChange={e => setCommentTeach(e.target.value)}
							disabled={isSubmitting}
							placeholder='Как вам преподаватель?'
							maxLength={500}
							rows={2}
							className='w-full rounded-2xl px-4 py-3 text-sm text-app-text placeholder:text-app-faint resize-none focus:outline-none disabled:opacity-60'
							style={{
								background: 'var(--color-surface-strong)',
								border: '1px solid var(--color-border)',
							}}
						/>
					</div>

					<div className='flex gap-2'>
						<div className='flex-1'>
							<SheetButton onClick={goToLesson} disabled={isSubmitting}>
								Назад
							</SheetButton>
						</div>
						<div className='flex-1'>
							<SheetButton
								variant='primary'
								onClick={submit}
								disabled={markTeach === 0 || isSubmitting}
							>
								{isSubmitting ? (
									<span className='flex items-center justify-center gap-2'>
										<Loader2 size={16} className='animate-spin' />
										Отправка
									</span>
								) : (
									'Отправить'
								)}
							</SheetButton>
						</div>
					</div>
				</div>
			)}
		</BottomSheet>
	)

	return createPortal(content, document.body)
}
