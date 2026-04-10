import { feedbackApi, useFeedbackStore } from '@/entities/feedback'
import { useCallback, useState } from 'react'

type Step = 'lesson' | 'teacher' | 'submitting' | 'success' | 'error'

export function useEvaluateLesson(itemKey: string) {
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

	const toggleLessonTag = useCallback(
		(id: number) => toggleTag(tagsLesson, setTagsLesson, id),
		[tagsLesson, toggleTag],
	)

	const toggleTeachTag = useCallback(
		(id: number) => toggleTag(tagsTeach, setTagsTeach, id),
		[tagsTeach, toggleTag],
	)

	const submit = useCallback(async () => {
		if (markLesson === 0 || markTeach === 0) return
		setStep('submitting')
		try {
			await feedbackApi.evaluate({
				key: itemKey,
				mark_lesson: markLesson,
				mark_teach: markTeach,
				tags_lesson: [...tagsLesson],
				tags_teach: [...tagsTeach],
				comment_lesson: commentLesson,
				comment_teach: commentTeach,
			})
			removePending(itemKey)
			setStep('success')
		} catch {
			setStep('error')
		}
	}, [
		itemKey,
		markLesson,
		markTeach,
		tagsLesson,
		tagsTeach,
		commentLesson,
		commentTeach,
		removePending,
	])

	const goToTeacher = useCallback(() => setStep('teacher'), [])
	const goToLesson = useCallback(() => setStep('lesson'), [])
	const retryFromTeacher = useCallback(() => setStep('teacher'), [])

	return {
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
		isSubmitting: step === 'submitting',
	}
}
