import { timing } from '@/shared/config'
import { useEffect, useRef } from 'react'
import { useAppUpdate } from './useAppUpdate'

export function useInitAppUpdate() {
	const { checkForUpdate } = useAppUpdate()
	const lastCheckRef = useRef<number>(0)

	useEffect(() => {
		async function run() {
			lastCheckRef.current = Date.now()
			await checkForUpdate()
		}

		const startupTimer = setTimeout(run, timing.APP_UPDATE_CHECK_DELAY)

		function handleVisibility() {
			if (document.visibilityState !== 'visible') return
			const elapsed = Date.now() - lastCheckRef.current
			if (elapsed < timing.APP_UPDATE_CHECK_COOLDOWN) return
			run()
		}

		document.addEventListener('visibilitychange', handleVisibility)

		return () => {
			clearTimeout(startupTimer)
			document.removeEventListener('visibilitychange', handleVisibility)
		}
	}, [checkForUpdate])
}
