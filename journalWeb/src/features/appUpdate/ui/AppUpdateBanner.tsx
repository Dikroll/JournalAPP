import { Download } from 'lucide-react'
import { useAppUpdate } from '../hooks/useAppUpdate'
import { useAppUpdateStore } from '../model/store'

export function AppUpdateBanner() {
	const { serverInfo, status } = useAppUpdate()
	const openSheet = useAppUpdateStore(s => s.openSheet)

	if (!serverInfo) return null

	const isDownloading = status === 'downloading'

	return (
		<button
			type='button'
			onClick={openSheet}
			disabled={isDownloading}
			className='w-full mb-3 flex items-center justify-between px-4 py-3.5 rounded-[18px] border disabled:opacity-60'
			style={{
				background:
					'linear-gradient(90deg, rgba(213,4,22,0.12), rgba(242,159,5,0.08))',
				borderColor: 'rgba(213,4,22,0.3)',
			}}
		>
			<div className='flex items-center gap-3'>
				<Download size={16} className='text-brand' />
				<div className='text-left'>
					<p className='text-sm font-semibold text-app-text'>
						Доступно обновление v{serverInfo.version}
					</p>
					<p className='text-xs text-app-muted'>
						{isDownloading
							? 'Скачивание...'
							: 'Нажмите чтобы скачать и установить'}
					</p>
				</div>
			</div>
			{!isDownloading && (
				<span className='text-xs font-semibold text-brand'>Установить</span>
			)}
		</button>
	)
}
