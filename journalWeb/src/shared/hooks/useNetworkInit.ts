import { useEffect } from 'react'
import { API_BASE_URL } from '../config/env'
import { timing } from '../config'
import { useNetworkStore } from '../model/networkStore'

const PROBE_URL = `${API_BASE_URL}/app/version`
const FAILURE_THRESHOLD = 2

async function probeReachability(signal: AbortSignal): Promise<boolean> {
	try {
		const response = await fetch(PROBE_URL, {
			method: 'GET',
			cache: 'no-store',
			signal,
			headers: { Accept: 'application/json' },
		})
		return response.ok
	} catch {
		return false
	}
}

export function useNetworkInit() {
	const setOnline = useNetworkStore(s => s.setOnline)

	useEffect(() => {
		let removeCapListener: (() => void) | null = null
		let intervalId: ReturnType<typeof setInterval> | null = null
		let currentAbort: AbortController | null = null
		let consecutiveFailures = 0
		let osSaysOnline = true
		let cancelled = false

		function applyState(reachable: boolean) {
			if (cancelled) return
			setOnline(osSaysOnline && reachable)
		}

		async function runProbe() {
			if (!osSaysOnline) {
				consecutiveFailures = 0
				return
			}
			if (currentAbort) currentAbort.abort()
			const abort = new AbortController()
			currentAbort = abort
			const timer = setTimeout(
				() => abort.abort(),
				timing.NETWORK_PROBE_TIMEOUT,
			)

			const ok = await probeReachability(abort.signal)
			clearTimeout(timer)
			if (cancelled) return

			if (ok) {
				consecutiveFailures = 0
				applyState(true)
			} else {
				consecutiveFailures++
				if (consecutiveFailures >= FAILURE_THRESHOLD) {
					applyState(false)
				}
			}
		}

		function handleOsOnline(connected: boolean) {
			osSaysOnline = connected
			if (!connected) {
				consecutiveFailures = 0
				applyState(false)
				return
			}
			runProbe()
		}

		async function initCapacitorNetwork() {
			try {
				const { Network } = await import('@capacitor/network')
				const status = await Network.getStatus()
				handleOsOnline(status.connected)

				const handle = await Network.addListener(
					'networkStatusChange',
					s => handleOsOnline(s.connected),
				)
				removeCapListener = () => handle.remove()
			} catch {
				handleOsOnline(navigator.onLine)
			}
		}

		function handleBrowserOnline() {
			handleOsOnline(true)
		}
		function handleBrowserOffline() {
			handleOsOnline(false)
		}
		function handleVisibility() {
			if (document.visibilityState === 'visible' && osSaysOnline) {
				runProbe()
			}
		}

		window.addEventListener('online', handleBrowserOnline)
		window.addEventListener('offline', handleBrowserOffline)
		document.addEventListener('visibilitychange', handleVisibility)

		initCapacitorNetwork().then(() => {
			if (!cancelled) runProbe()
		})

		intervalId = setInterval(runProbe, timing.NETWORK_PROBE_INTERVAL)

		return () => {
			cancelled = true
			window.removeEventListener('online', handleBrowserOnline)
			window.removeEventListener('offline', handleBrowserOffline)
			document.removeEventListener('visibilitychange', handleVisibility)
			if (intervalId) clearInterval(intervalId)
			if (currentAbort) currentAbort.abort()
			removeCapListener?.()
		}
	}, [setOnline])
}
