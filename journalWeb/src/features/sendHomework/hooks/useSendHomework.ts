import { useHomeworkStore } from '@/entities/homework'
import { useOfflineQueueStore } from '@/features/offlineQueue'
import { saveFileForQueue } from '@/features/offlineQueue/lib/fileStorage'
import { getIsOnline } from '@/shared/model/networkStore'
import { useCallback, useState } from 'react'
import { sendHomeworkApi } from '../api'
import type { SendStep } from '../model/types'

const FORBIDDEN = ['.txt', '.csv']
const MIN_TEXT = 5

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
	onRefresh?: () => void,
) {
	const invalidate = useHomeworkStore(s => s.invalidate)
	const removeItem = useHomeworkStore(s => s.removeItem)
	const addToQueue = useOfflineQueueStore(s => s.addItem)

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

		if (!getIsOnline()) {
			try {
				const queueId = `hw-${Date.now()}`
				let fileLocalPath: string | null = null

				if (hasFile) {
					fileLocalPath = await saveFileForQueue(state.file!, queueId)
				}

				addToQueue({
					id: queueId,
					homeworkId,
					studId: studId ?? homeworkId,
					userId,
					text: trimmed,
					mark: state.mark,
					fileName: state.file?.name ?? null,
					fileLocalPath,
					fileMimeType: state.file?.type ?? null,
					status: 'pending',
					attempts: 0,
					lastError: null,
					createdAt: Date.now(),
				})

				removeItem(homeworkId)
				setState(s => ({ ...s, step: 'queued' }))
				onSuccess?.()
			} catch {
				setState(s => ({
					...s,
					step: 'error',
					error: 'Не удалось сохранить задание для отложенной отправки',
				}))
			}
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

			removeItem(homeworkId)
			invalidate()
			onRefresh?.()

			setState(s => ({ ...s, step: 'success' }))
			onSuccess?.()
		} catch (err: unknown) {
			const response = (
				err as { response?: { data?: { detail?: unknown; message?: string } } }
			)?.response?.data
			const detail = response?.detail
			const msg = Array.isArray(detail)
				? (detail as { msg: string }[]).map(d => d.msg).join(', ')
				: typeof detail === 'string'
					? detail
					: (response?.message ?? 'Ошибка отправки')
			setState(s => ({ ...s, step: 'error', error: msg }))
		}
	}, [
		state,
		homeworkId,
		studId,
		userId,
		invalidate,
		removeItem,
		addToQueue,
		onSuccess,
		onRefresh,
	])

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
