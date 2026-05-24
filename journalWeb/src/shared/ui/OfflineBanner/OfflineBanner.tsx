import { useNetworkStore } from '@/shared/model/networkStore'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
	const isOnline = useNetworkStore(s => s.isOnline)

	if (isOnline) return null

	return (
		<div className='w-full flex justify-center mb-1 mt-2'>
			<div
				className='w-full max-w-[520px] mx-4 rounded-[20px] px-4 py-3 border bg-app-surface border-app-border'
				style={{
					boxShadow: '0 2px 12px 0 rgba(0,0,0,0.25)',
					backdropFilter: 'blur(16px)',
				}}
			>
				<div className='flex items-center gap-3'>
					<div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-red-500/30 bg-red-500/10'>
						<WifiOff size={14} className='text-red-400' />
					</div>

					<div className='flex flex-col leading-tight'>
						<span className='text-[13px] font-semibold text-app-text'>
							Нет подключения к интернету
						</span>

						<span className='text-[11px] text-app-muted'>
							Проверь соединение и попробуй снова
						</span>
					</div>

					<div className='ml-auto flex items-center gap-1 text-[10px] font-medium text-red-400'>
						<span className='w-1.5 h-1.5 rounded-full bg-red-400' />
						ОФЛАЙН
					</div>
				</div>
			</div>
		</div>
	)
}
