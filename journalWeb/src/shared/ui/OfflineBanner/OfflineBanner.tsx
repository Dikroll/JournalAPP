import { useNetworkStore } from '@/shared/model/networkStore'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
	const isOnline = useNetworkStore(s => s.isOnline)

	if (isOnline) return null

	return (
		<div className='flex items-center justify-center gap-1.5 bg-amber-600/90 text-white text-xs text-center py-1.5 px-4'>
			<WifiOff size={12} />
			<span>Нет подключения к интернету</span>
		</div>
	)
}
