import { homeworkApi } from '@/entities/homework/api'
import type { HomeworkStatus } from '@/entities/homework/hooks/useHomeworkGroups'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { SendHomeworkSheet } from '@/features/sendHomework/ui/SendHomeworkSheet'
import { Download, ExternalLink, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'

interface Props {
	homeworkId: number
	homeworkTheme: string
	statusKey: HomeworkStatus
	fileUrl: string | null
	studAnswer: string | null
	studFileUrl: string | null
	studId: number | null
}

export function HomeworkCardActions({
	homeworkId,
	homeworkTheme,
	statusKey,
	fileUrl,
	studAnswer,
	studFileUrl,
	studId,
}: Props) {
	const [sheetOpen, setSheetOpen] = useState(false)
	const [showDeleteWarning, setShowDeleteWarning] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const { removeItem, reset: resetStore, loadedAt } = useHomeworkStore()

	const invalidateCache = () => useHomeworkStore.setState({ loadedAt: null })

	const isChecked = statusKey === 'checked'
	const isReturned = statusKey === 'returned'
	const isPending = statusKey === 'pending'
	const showThreeButtons = isPending || isChecked

	const studResultUrl =
		studFileUrl ?? (studAnswer?.startsWith('http') ? studAnswer : null)

	const handleDelete = async () => {
		if (!studId) return
		setIsDeleting(true)
		try {
			await homeworkApi.deleteSubmission(studId)
			removeItem(homeworkId)
			invalidateCache()
		} catch {
		} finally {
			setIsDeleting(false)
			setShowDeleteWarning(false)
		}
	}

	const DownloadTaskBtn = (
		<button
			type='button'
			onClick={() => fileUrl && window.open(fileUrl, '_blank')}
			disabled={!fileUrl}
			title='Скачать задание'
			className='flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] border border-white/10 transition-colors text-xs'
		>
			<Download size={14} />
			<span>Задание</span>
		</button>
	)

	const ViewAnswerBtn = (
		<button
			type='button'
			onClick={() => studResultUrl && window.open(studResultUrl, '_blank')}
			disabled={!studResultUrl}
			title='Мой ответ'
			className='flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] border border-white/10 transition-colors text-xs'
		>
			<ExternalLink size={14} />
			<span>Ответ</span>
		</button>
	)

	const UploadBtn = ({ label, red }: { label: string; red?: boolean }) => (
		<button
			type='button'
			onClick={() => setSheetOpen(true)}
			className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-medium transition-colors ${
				red
					? 'bg-[#DC2626]/15 hover:bg-[#DC2626]/25 text-[#DC2626] border border-[#DC2626]/30'
					: 'bg-white/10 hover:bg-white/15 text-[#F2F2F2] border border-white/20'
			}`}
		>
			<Upload size={14} />
			<span>{label}</span>
		</button>
	)

	const DeleteBtn = (
		<button
			type='button'
			onClick={() => setShowDeleteWarning(true)}
			disabled={!studId}
			title='Удалить сданное ДЗ'
			className='flex items-center justify-center px-3 py-2.5 bg-white/5 hover:bg-[#DC2626]/15 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-[#9CA3AF] hover:text-[#DC2626] border border-white/10 hover:border-[#DC2626]/30 transition-colors'
		>
			<Trash2 size={14} />
		</button>
	)

	return (
		<>
			<div className='flex items-center gap-2'>
				{showThreeButtons ? (
					<>
						<div className='flex gap-2 flex-1'>
							{DownloadTaskBtn}
							{ViewAnswerBtn}
						</div>
						{DeleteBtn}
					</>
				) : isReturned ? (
					<>
						<UploadBtn label='Загрузить заново' red />
						{DownloadTaskBtn}
					</>
				) : (
					<>
						<UploadBtn label='Загрузить' />
						{DownloadTaskBtn}
					</>
				)}
			</div>

			{showDeleteWarning && (
				<div className='mt-3 p-3 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-2xl'>
					<p className='text-sm text-[#F2F2F2] mb-3'>
						Удалить сданное задание? Это действие нельзя отменить.
					</p>
					<div className='flex gap-2'>
						<button
							type='button'
							onClick={() => setShowDeleteWarning(false)}
							disabled={isDeleting}
							className='flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#F2F2F2] text-sm transition-colors'
						>
							Отмена
						</button>
						<button
							type='button'
							onClick={handleDelete}
							disabled={isDeleting}
							className='flex-1 px-4 py-2 bg-[#DC2626] hover:bg-[#DC2626]/90 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50'
						>
							{isDeleting ? 'Удаляем...' : 'Удалить'}
						</button>
					</div>
				</div>
			)}

			{sheetOpen && (
				<SendHomeworkSheet
					homeworkId={homeworkId}
					studId={studId}
					homeworkTheme={homeworkTheme}
					onClose={() => setSheetOpen(false)}
				/>
			)}
		</>
	)
}
