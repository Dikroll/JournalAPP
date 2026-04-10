import { BottomSheet, IconButton } from '@/shared/ui'
import { Download, X } from 'lucide-react'
import { useAppUpdate } from '../hooks/useAppUpdate'

const LABEL_PATTERN = /^(fix|add|change|remove|update|feat|refactor|improve):\s*/i

function parseChangelog(raw: string) {
	return raw
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => {
			const match = line.match(LABEL_PATTERN)
			if (match) {
				return { label: match[1].toLowerCase(), text: line.slice(match[0].length) }
			}
			return { label: null, text: line }
		})
}

function changelogLabelStyle(label: string) {
	switch (label) {
		case 'fix':
			return 'bg-[#EF4444]/15 text-[#F87171]'
		case 'add':
		case 'feat':
			return 'bg-[#22C55E]/15 text-[#4ADE80]'
		case 'change':
		case 'update':
		case 'improve':
			return 'bg-[#3B82F6]/15 text-[#60A5FA]'
		case 'remove':
			return 'bg-[#F59E0B]/15 text-[#FBBF24]'
		case 'refactor':
			return 'bg-[#8B5CF6]/15 text-[#A78BFA]'
		default:
			return 'bg-white/10 text-[#9CA3AF]'
	}
}

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
						<p className='text-xs text-[#9CA3AF] mb-2'>Что нового</p>
						<ul className='space-y-1.5'>
							{parseChangelog(serverInfo.changelog).map((entry, i) => (
								<li key={i} className='flex items-start gap-2 text-sm text-[#E5E7EB] leading-relaxed'>
									{entry.label && (
										<span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase leading-none ${changelogLabelStyle(entry.label)}`}>
											{entry.label}
										</span>
									)}
									<span>{entry.text}</span>
								</li>
							))}
						</ul>
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
