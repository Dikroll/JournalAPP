import { useHomework } from '@/entities/homework'
import { useUserStore } from '@/entities/user'
import { timing } from '@/shared/config'
import { BottomSheet, IconButton, SheetButton, SuccessStateView } from '@/shared/ui'
import { Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useSendHomework } from '../hooks/useSendHomework'
import { FileDropZone } from './FileDropZone'
import { StarRating } from './StarRating'

interface Props {
	homeworkId: number
	studId: number | null
	homeworkTheme: string
	onClose: () => void
}

export function SendHomeworkSheet({
	homeworkId,
	studId,
	homeworkTheme,
	onClose,
}: Props) {
	const userId = useUserStore(s => s.user?.student_id ?? null)
	const { refresh } = useHomework()

	const {
		file,
		text,
		mark,
		step,
		error,
		isLoading,
		loadingLabel,
		setFile,
		setText,
		setMark,
		submit,
		reset,
	} = useSendHomework(
		homeworkId,
		studId,
		userId,
		() =>
			setTimeout(() => {
				reset()
				onClose()
			}, timing.SUCCESS_DISMISS_DELAY),
		refresh,
	)

	const isSuccess = step === 'success'
	const showTextarea = !file

	const content = (
		<BottomSheet onBackdropClick={isLoading ? undefined : onClose}>
			<div className='flex items-start justify-between mb-5'>
				<div className='flex-1 pr-3'>
					<p className='text-base font-semibold text-app-text mb-0.5'>
						Отправить задание
					</p>
					<p className='text-xs text-app-muted line-clamp-2 leading-relaxed'>
						{homeworkTheme}
					</p>
				</div>
				<IconButton
					icon={<X size={14} />}
					onClick={e => {
						e.preventDefault()
						onClose()
					}}
					disabled={isLoading}
					variant='surface'
					shape='square'
				/>
			</div>

			{isSuccess ? (
				<SuccessStateView
					title='Задание отправлено!'
					subtitle='Ожидайте проверки преподавателя'
				/>
			) : (
				<div className='space-y-4'>
					<div>
						<p className='text-xs text-app-muted mb-2'>Файл</p>
						<FileDropZone file={file} onChange={setFile} />
					</div>

					{!file && (
						<div className='flex items-center gap-3'>
							<div className='flex-1 h-px bg-app-border' />
							<span className='text-[11px] text-app-muted'>или</span>
							<div className='flex-1 h-px bg-app-border' />
						</div>
					)}

					{showTextarea && (
						<div>
							<p className='text-xs text-app-muted mb-2'>Текстовый ответ</p>
							<textarea
								value={text}
								onChange={e => setText(e.target.value)}
								placeholder='Введите ответ...'
								rows={3}
								className='w-full rounded-2xl px-4 py-3 text-sm text-app-text placeholder:text-app-muted resize-none focus:outline-none'
								style={{
									background: 'var(--color-surface-strong)',
									border: '1px solid var(--color-border)',
								}}
							/>
							{text.length > 0 && text.length < 5 && (
								<p className='text-xs text-app-muted mt-1 px-1'>
									Ещё {5 - text.length} симв.
								</p>
							)}
						</div>
					)}

					<div className='pt-1'>
						<StarRating value={mark} onChange={setMark} />
					</div>

					{error && <p className='text-xs text-danger px-1'>{error}</p>}

					<SheetButton
						variant='primary'
						onClick={() => submit()}
						disabled={isLoading}
					>
						{isLoading ? (
							<span className='flex items-center justify-center gap-2'>
								<Loader2 size={15} className='animate-spin' /> {loadingLabel}
							</span>
						) : (
							'Отправить'
						)}
					</SheetButton>
				</div>
			)}
		</BottomSheet>
	)

	return createPortal(content, document.body)
}
