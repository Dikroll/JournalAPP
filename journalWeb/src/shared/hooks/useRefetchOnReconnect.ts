import { useEffect, useRef } from 'react'
import { useNetworkStore } from '../model/networkStore'

export function useRefetchOnReconnect(refetch: () => void) {
	const isOnline = useNetworkStore(s => s.isOnline)
	const prevRef = useRef(isOnline)

	useEffect(() => {
		if (isOnline && !prevRef.current) {
			refetch()
		}
		prevRef.current = isOnline
	}, [isOnline, refetch])
}
