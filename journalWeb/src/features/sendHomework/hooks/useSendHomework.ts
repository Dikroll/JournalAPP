import { useHomeworkStore } from '@/entities/homework/model/store'
import { useCallback, useState } from 'react'
import { sendHomeworkApi } from '../api'

const FORBIDDEN = ['.txt', '.csv']
const MIN_TEXT = 5

export type SendStep = 'idle' | 'uploading' | 'submitting' | 'success' | 'error'

interface State {
	file: File | null
	text: string
	mark: number
	step: SendStep
	error: string | null
}

export function useSendHomework(
	homeworkId: number,
	studId: number | null,
	userId: number | null,
	onSuccess?: () => void,
) {
	const invalidate = useHomeworkStore(s => s.invalidate)

	const [state, setState] = useState<State>({
		file: null,
		text: '',
		mark: 5,
		step: 'idle',
		error: null,
	})

	const setFile = useCallback((f: File | null) => {
		if (!f) {
			setState(s => ({ ...s, file: null, error: null }))
			return
		}
		const ext = '.' + f.name.split('.').pop()?.toLowerCase()
		if (FORBIDDEN.includes(ext)) {
			setState(s => ({ ...s, error: 'Файлы .txt и .csv не принимаются' }))
			return
		}
		setState(s => ({ ...s, file: f, error: null }))
	}, [])

	const setText = useCallback(
		(v: string) => setState(s => ({ ...s, text: v, error: null })),
		[],
	)

	const setMark = useCallback(
		(v: number) => setState(s => ({ ...s, mark: v, error: null })),
		[],
	)

	const reset = useCallback(
		() =>
			setState({ file: null, text: '', mark: 5, step: 'idle', error: null }),
		[],
	)

	const submit = useCallback(async () => {
		const trimmed = state.text.trim()
		const hasFile = !!state.file
		const hasText = trimmed.length >= MIN_TEXT
		const textTooShort = trimmed.length > 0 && trimmed.length < MIN_TEXT

		if (!hasFile && !hasText) {
			setState(s => ({
				...s,
				error: textTooShort
					? `Текст слишком короткий — минимум ${MIN_TEXT} символов`
					: 'Прикрепите файл или введите текстовый ответ',
			}))
			return
		}

		try {
			let filename = ''
			let file_path = ''
			let tmp_file = ''

			if (hasFile) {
				setState(s => ({ ...s, step: 'uploading', error: null }))
				const uploaded = await sendHomeworkApi.uploadFile(state.file!)
				filename = uploaded.filename
				file_path = uploaded.file_path
				tmp_file = uploaded.tmp_file
			}

			setState(s => ({ ...s, step: 'submitting' }))

			await sendHomeworkApi.submit({
				id: studId ?? homeworkId,
				stud_answer: trimmed || null,
				filename: filename || null,
				file_path: file_path || null,
				tmp_file: tmp_file || null,
			})

			if (userId != null) {
				await sendHomeworkApi
					.evaluate({
						id: null,
						id_dom_zad: homeworkId,
						id_stud: userId,
						mark: state.mark,
						comment: '',
						tags: [],
					})
					.catch(() => {})
			}

			invalidate()

			setState(s => ({ ...s, step: 'success' }))
			onSuccess?.()
		} catch (e: any) {
			const detail = e?.response?.data?.detail
			const msg = Array.isArray(detail)
				? detail.map((d: any) => d.msg).join(', ')
				: (detail ?? e?.response?.data?.message ?? 'Ошибка отправки')
			setState(s => ({ ...s, step: 'error', error: msg }))
		}
	}, [state, homeworkId, studId, userId, invalidate, onSuccess])

	const isLoading = state.step === 'uploading' || state.step === 'submitting'
	const loadingLabel =
		state.step === 'uploading' ? 'Загружаем файл...' : 'Отправляем...'

	return {
		file: state.file,
		text: state.text,
		mark: state.mark,
		step: state.step,
		error: state.error,
		isLoading,
		loadingLabel,
		setFile,
		setText,
		setMark,
		submit,
		reset,
	}
}
