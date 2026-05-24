import { homeworkApi, useHomework, useHomeworkStore } from '@/entities/homework'
import { useCallback, useState } from 'react'

export type DeleteStep = 'idle' | 'deleting' | 'success' | 'error'

export function useDeleteHomework(studId: number | null, homeworkId: number) {
	const removeItem = useHomeworkStore(s => s.removeItem)
	const { refresh } = useHomework()

	const [step, setStep] = useState<DeleteStep>('idle')
	const [error, setError] = useState<string | null>(null)

	const deleteHomework = useCallback(
		async (onSuccess?: () => void) => {
			if (studId == null) return

			setStep('deleting')
			setError(null)

			try {
				await homeworkApi.deleteSubmission(studId)
			} catch (err: unknown) {
				const status = (err as { response?: { status?: number } })?.response
					?.status

				if (status !== 404) {
					const detail = (err as { response?: { data?: { detail?: string } } })
						?.response?.data?.detail
					setError(detail ?? 'Ошибка удаления')
					setStep('error')
					return
				}
			}

			removeItem(homeworkId)
			refresh()

			setStep('success')
			onSuccess?.()
		},
		[studId, homeworkId, removeItem, refresh],
	)

	const reset = useCallback(() => {
		setStep('idle')
		setError(null)
	}, [])

	return {
		deleteHomework,
		step,
		error,
		isDeleting: step === 'deleting',
		reset,
	}
}
