import type { FeedbackTag, PendingFeedback } from '@/entities/feedback'
import { feedbackApi, useFeedbackStore } from '@/entities/feedback'
import { FEEDBACK_TAG_LABELS } from '@/shared/config/feedbackTags'
import { BottomSheet, SuccessStateView } from '@/shared/ui'
import { BookOpen, Loader2, User } from 'lucide-react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { StarRating } from './StarRating'

type Step = 'lesson' | 'teacher' | 'submitting' | 'success' | 'error'

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
	const [step, setStep] = useState<Step>('lesson')
	const [markLesson, setMarkLesson] = useState(0)
	const [markTeach, setMarkTeach] = useState(0)
	const [tagsLesson, setTagsLesson] = useState<Set<number>>(new Set())
	const [tagsTeach, setTagsTeach] = useState<Set<number>>(new Set())
	const [commentLesson, setCommentLesson] = useState('')
	const [commentTeach, setCommentTeach] = useState('')

	const removePending = useFeedbackStore(s => s.removePending)

	const toggleTag = useCallback(
		(set: Set<number>, setFn: (s: Set<number>) => void, id: number) => {
			const next = new Set(set)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			setFn(next)
		},
		[],
	)

	const handleSubmit = useCallback(async () => {
		if (markLesson === 0 || markTeach === 0) return
		setStep('submitting')
		try {
			await feedbackApi.evaluate({
				key: item.key,
				mark_lesson: markLesson,
				mark_teach: markTeach,
				tags_lesson: [...tagsLesson],
				tags_teach: [...tagsTeach],
				comment_lesson: commentLesson,
				comment_teach: commentTeach,
			})
			removePending(item.key)
			setStep('success')
		} catch {
			setStep('error')
		}
	}, [
		item.key,
		markLesson,
		markTeach,
		tagsLesson,
		tagsTeach,
		commentLesson,
		commentTeach,
		removePending,
	])

	const isSubmitting = step === 'submitting'

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
					<button
						type='button'
						onClick={onClose}
						className='w-full h-12 rounded-2xl text-sm font-semibold mt-2'
						style={{
							background: 'var(--color-surface-strong)',
							border: '1px solid var(--color-border)',
							color: 'var(--color-text)',
						}}
					>
						Закрыть
					</button>
				</>
			)}

			{step === 'error' && (
				<div className='flex flex-col items-center py-6 gap-3'>
					<p className='text-sm font-semibold text-status-overdue'>
						Не удалось отправить оценку
					</p>
					<p className='text-xs text-app-muted'>Попробуйте ещё раз</p>
					<button
						type='button'
						onClick={() => setStep('teacher')}
						className='h-10 px-6 rounded-2xl text-sm font-semibold'
						style={{
							background: 'var(--color-brand)',
							color: '#fff',
						}}
					>
						Повторить
					</button>
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
								onToggle={id =>
									toggleTag(tagsLesson, setTagsLesson, id)
								}
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

					<button
						type='button'
						disabled={markLesson === 0}
						onClick={() => setStep('teacher')}
						className='w-full h-12 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40'
						style={{
							background: 'var(--color-brand)',
							color: '#fff',
						}}
					>
						Далее — оценка преподавателя
					</button>
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
								onToggle={id =>
									isSubmitting
										? undefined
										: toggleTag(tagsTeach, setTagsTeach, id)
								}
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
						<button
							type='button'
							disabled={isSubmitting}
							onClick={() => setStep('lesson')}
							className='flex-1 h-12 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40'
							style={{
								background: 'var(--color-surface-strong)',
								border: '1px solid var(--color-border)',
								color: 'var(--color-text)',
							}}
						>
							Назад
						</button>
						<button
							type='button'
							disabled={markTeach === 0 || isSubmitting}
							onClick={handleSubmit}
							className='flex-1 h-12 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2'
							style={{
								background: 'var(--color-brand)',
								color: '#fff',
							}}
						>
							{isSubmitting && (
								<Loader2 size={16} className='animate-spin' />
							)}
							Отправить
						</button>
					</div>
				</div>
			)}
		</BottomSheet>
	)

	return createPortal(content, document.body)
}
