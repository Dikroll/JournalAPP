import { getChangelogLabelStyle, parseChangelogItems } from '@/shared/lib/appRelease'
import { BottomSheet, GlassCard, IconButton, SheetButton } from '@/shared/ui'
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
							<p className='text-sm font-semibold text-app-text'>
								Доступно обновление
							</p>
							<p className='text-xs text-app-muted mt-0.5'>
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
					<GlassCard>
						<p className='text-xs text-app-muted mb-2'>Что нового</p>
						<ul className='space-y-1.5'>
							{parseChangelogItems(serverInfo.changelog).map((entry, i) => (
								<li key={i} className='flex items-start gap-2 text-sm text-app-text leading-relaxed'>
									{entry.label && (
										<span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase leading-none ${getChangelogLabelStyle(entry.label)}`}>
											{entry.label}
										</span>
									)}
									<span>{entry.text}</span>
								</li>
							))}
						</ul>
					</GlassCard>
				)}

				{/* Прогресс скачивания */}
				{isDownloading && (
					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<p className='text-xs text-app-muted'>Скачивание...</p>
							<p className='text-xs font-semibold text-app-text'>
								{downloadProgress}%
							</p>
						</div>
						<div className='h-2 bg-glass-active rounded-full overflow-hidden'>
							<div
								className='h-full rounded-full transition-all duration-300'
								style={{
									width: `${downloadProgress}%`,
									background: 'linear-gradient(90deg, var(--color-gradient-from), var(--color-gradient-to))',
								}}
							/>
						</div>
						<p className='text-[11px] text-app-muted'>
							После скачивания откроется установщик Android
						</p>
					</div>
				)}

				{/* Ошибка */}
				{isError && errorMessage && (
					<div className='bg-danger-subtle border border-danger-border rounded-2xl px-4 py-3'>
						<p className='text-sm text-danger'>{errorMessage}</p>
					</div>
				)}

				{/* Кнопки */}
				{!isDownloading && (
					<div className='space-y-2'>
						<SheetButton variant='primary' onClick={downloadAndInstall}>
							{isError ? 'Попробовать снова' : 'Скачать и установить'}
						</SheetButton>
						<SheetButton onClick={dismiss}>
							Напомнить позже
						</SheetButton>
					</div>
				)}
			</div>
		</BottomSheet>
	)
}
