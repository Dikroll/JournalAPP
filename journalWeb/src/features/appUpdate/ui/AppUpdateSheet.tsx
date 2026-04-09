import { BottomSheet, IconButton } from '@/shared/ui'
import { Download, X } from 'lucide-react'
import { useAppUpdate } from '../hooks/useAppUpdate'

export function AppUpdateSheet() {
	const {
		status,
		serverInfo,
		downloadProgress,
		errorMessage,
		downloadAndInstall,
		dismiss,
	} = useAppUpdate()

	// Показываем только когда есть доступное обновление или идёт скачивание/ошибка
	if (status === 'idle' || status === 'checking' || !serverInfo) return null

	const isDownloading = status === 'downloading'
	const isError = status === 'error'

	return (
		<BottomSheet onBackdropClick={isDownloading ? undefined : dismiss} zIndex={300} maxWidth='max-w-lg'>
			<div className='space-y-4'>
				{/* Header */}
				<div className='flex items-start justify-between'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center'>
							<Download size={18} className='text-brand' />
						</div>
						<div>
							<p className='text-sm font-semibold text-[#F2F2F2]'>
								Доступно обновление
							</p>
							<p className='text-xs text-[#6B7280] mt-0.5'>
								Версия {serverInfo.version}
							</p>
						</div>
					</div>

					{!isDownloading && (
						<IconButton
							icon={<X size={14} />}
							onClick={dismiss}
							aria-label='Закрыть'
						/>
					)}
				</div>

				{/* Changelog */}
				{serverInfo.changelog && (
					<div className='bg-white/5 border border-white/8 rounded-2xl px-4 py-3'>
						<p className='text-xs text-[#9CA3AF] mb-1'>Что нового</p>
						<p className='text-sm text-[#E5E7EB] leading-relaxed'>
							{serverInfo.changelog}
						</p>
					</div>
				)}

				{/* Прогресс скачивания */}
				{isDownloading && (
					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<p className='text-xs text-[#9CA3AF]'>Скачивание...</p>
							<p className='text-xs font-semibold text-[#F2F2F2]'>
								{downloadProgress}%
							</p>
						</div>
						<div className='h-2 bg-white/10 rounded-full overflow-hidden'>
							<div
								className='h-full rounded-full transition-all duration-300'
								style={{
									width: `${downloadProgress}%`,
									background: 'linear-gradient(90deg, var(--color-gradient-from), var(--color-gradient-to))',
								}}
							/>
						</div>
						<p className='text-[11px] text-[#6B7280]'>
							После скачивания откроется установщик Android
						</p>
					</div>
				)}

				{/* Ошибка */}
				{isError && errorMessage && (
					<div className='bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl px-4 py-3'>
						<p className='text-sm text-[#EF4444]'>{errorMessage}</p>
					</div>
				)}

				{/* Кнопки */}
				{!isDownloading && (
					<div className='space-y-2'>
						<button
							type='button'
							onClick={downloadAndInstall}
							className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-white'
							style={{
								background: 'linear-gradient(90deg, var(--color-brand), var(--color-brand-hover))',
							}}
						>
							{isError ? 'Попробовать снова' : 'Скачать и установить'}
						</button>

						<button
							type='button'
							onClick={dismiss}
							className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8'
						>
							Напомнить позже
						</button>
					</div>
				)}
			</div>
		</BottomSheet>
	)
}
