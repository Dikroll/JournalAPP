import { useHomework } from '@/entities/homework'
import { useUserStore } from '@/entities/user'
import { CheckCircle, Loader2, X } from 'lucide-react'
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
			}, 1500),
		refresh,
	)

	const isSuccess = step === 'success'
	const showTextarea = !file

	return createPortal(
		<div
			className='fixed inset-0 z-50 flex items-center justify-center px-4'
			onClick={e => {
				if (e.target === e.currentTarget && !isLoading) onClose()
			}}
		>
			<div className='absolute inset-0 bg-black/50 backdrop-blur-md' />

			<div
				className='relative w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 px-5 py-5'
				style={{ boxShadow: 'var(--shadow-modal)' }}
			>
				<div className='flex items-start justify-between mb-5'>
					<div className='flex-1 pr-3'>
						<p className='text-base font-semibold text-[#F2F2F2] mb-0.5'>
							Отправить задание
						</p>
						<p className='text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed'>
							{homeworkTheme}
						</p>
					</div>
					<button
						type='button'
						onClick={e => {
							e.preventDefault()
							onClose()
						}}
						disabled={isLoading}
						className='shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40'
					>
						<X size={14} className='text-[#9CA3AF]' />
					</button>
				</div>

				{isSuccess ? (
					<div className='flex flex-col items-center py-6 gap-3'>
						<div className='w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center'>
							<CheckCircle size={26} className='text-[#10B981]' />
						</div>
						<p className='text-sm font-semibold text-[#F2F2F2]'>
							Задание отправлено!
						</p>
						<p className='text-xs text-[#9CA3AF]'>
							Ожидайте проверки преподавателя
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						<div>
							<p className='text-xs text-[#9CA3AF] mb-2'>Файл</p>
							<FileDropZone file={file} onChange={setFile} />
						</div>

						{!file && (
							<div className='flex items-center gap-3'>
								<div className='flex-1 h-px bg-white/10' />
								<span className='text-[11px] text-[#6B7280]'>или</span>
								<div className='flex-1 h-px bg-white/10' />
							</div>
						)}

						{showTextarea && (
							<div>
								<p className='text-xs text-[#9CA3AF] mb-2'>Текстовый ответ</p>
								<textarea
									value={text}
									onChange={e => setText(e.target.value)}
									placeholder='Введите ответ...'
									rows={3}
									className='w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-[#F2F2F2] placeholder:text-[#6B7280] resize-none focus:outline-none focus:border-white/20'
								/>
								{text.length > 0 && text.length < 5 && (
									<p className='text-xs text-[#9CA3AF] mt-1 px-1'>
										Ещё {5 - text.length} симв.
									</p>
								)}
							</div>
						)}

						<div className='pt-1'>
							<StarRating value={mark} onChange={setMark} />
						</div>

						{error && <p className='text-xs text-[#EF4444] px-1'>{error}</p>}

						<button
							type='button'
							onClick={e => {
								e.preventDefault()
								submit()
							}}
							disabled={isLoading}
							className='w-full flex items-center justify-center gap-2 py-3 rounded-[18px] bg-white/10 hover:bg-white/15 border border-white/10 text-[#F2F2F2] text-sm font-semibold disabled:opacity-50'
						>
							{isLoading ? (
								<>
									<Loader2 size={15} className='animate-spin' /> {loadingLabel}
								</>
							) : (
								'Отправить'
							)}
						</button>
					</div>
				)}
			</div>
		</div>,
		document.body,
	)
}
