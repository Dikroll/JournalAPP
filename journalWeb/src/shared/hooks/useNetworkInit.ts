import { useEffect } from 'react'
import { useNetworkStore } from '../model/networkStore'

export function useNetworkInit() {
	const setOnline = useNetworkStore(s => s.setOnline)

	useEffect(() => {
		let removeCapListener: (() => void) | null = null

		async function initCapacitorNetwork() {
			try {
				const { Network } = await import('@capacitor/network')
				const status = await Network.getStatus()
				setOnline(status.connected)

				const handle = await Network.addListener(
					'networkStatusChange',
					s => setOnline(s.connected),
				)
				removeCapListener = () => handle.remove()
			} catch {
				setOnline(navigator.onLine)
			}
		}

		function handleOnline() {
			setOnline(true)
		}
		function handleOffline() {
			setOnline(false)
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)
		initCapacitorNetwork()

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
			removeCapListener?.()
		}
	}, [setOnline])
}
