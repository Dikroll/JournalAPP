import { useHomeworkStore } from '@/entities/homework/model/store'
import { sendHomeworkApi } from '@/features/sendHomework/api'
import { getIsOnline, useNetworkStore } from '@/shared/model/networkStore'
import { useEffect, useRef } from 'react'
import { deleteQueueFile, readFileFromQueue } from '../lib/fileStorage'
import { useOfflineQueueStore } from '../model/store'
import type { QueuedHomework } from '../model/types'

const MAX_ATTEMPTS = 3

async function processItem(item: QueuedHomework): Promise<void> {
	let filename = ''
	let file_path = ''
	let tmp_file = ''

	if (item.fileLocalPath && item.fileName) {
		const file = await readFileFromQueue(
			item.fileLocalPath,
			item.fileName,
			item.fileMimeType ?? '',
		)
		const uploaded = await sendHomeworkApi.uploadFile(file)
		filename = uploaded.filename
		file_path = uploaded.file_path
		tmp_file = uploaded.tmp_file
	}

	await sendHomeworkApi.submit({
		id: item.studId ?? item.homeworkId,
		stud_answer: item.text || null,
		filename: filename || null,
		file_path: file_path || null,
		tmp_file: tmp_file || null,
	})

	if (item.userId != null) {
		await sendHomeworkApi
			.evaluate({
				id: null,
				id_dom_zad: item.homeworkId,
				id_stud: item.userId,
				mark: item.mark,
				comment: '',
				tags: [],
			})
			.catch(() => {})
	}
}

async function processQueue() {
	const { items, updateItem, removeItem } =
		useOfflineQueueStore.getState()
	const pending = items.filter(
		i =>
			(i.status === 'pending' || i.status === 'failed') &&
			i.attempts < MAX_ATTEMPTS,
	)

	for (const item of pending) {
		if (!getIsOnline()) break

		updateItem(item.id, { status: 'processing' })

		try {
			await processItem(item)

			if (item.fileLocalPath) {
				await deleteQueueFile(item.fileLocalPath).catch(() => {})
			}

			removeItem(item.id)
			useHomeworkStore.getState().removeItem(item.homeworkId)
			useHomeworkStore.getState().invalidate()
		} catch (err) {
			updateItem(item.id, {
				status: 'failed',
				attempts: item.attempts + 1,
				lastError:
					err instanceof Error ? err.message : 'Ошибка отправки',
			})
		}
	}
}

export function useQueueProcessor() {
	const isOnline = useNetworkStore(s => s.isOnline)
	const items = useOfflineQueueStore(s => s.items)
	const processingRef = useRef(false)

	useEffect(() => {
		if (!isOnline) return
		if (processingRef.current) return

		const hasPending = items.some(
			i =>
				(i.status === 'pending' || i.status === 'failed') &&
				i.attempts < MAX_ATTEMPTS,
		)
		if (!hasPending) return

		processingRef.current = true
		processQueue().finally(() => {
			processingRef.current = false
		})
	}, [isOnline, items])
}
