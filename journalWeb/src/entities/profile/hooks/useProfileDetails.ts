import { getIsOnline } from '@/shared/model/networkStore'
import { useAuthStore } from '@/shared/model/authStore'
import { useEffect } from 'react'
import { profileApi } from '../api/index'
import { useProfileDetailsStore } from '../model/store'

export function useProfileDetails() {
	const activeUsername = useAuthStore(s => s.activeUsername)
	const details = useProfileDetailsStore(s => s.details)
	const status = useProfileDetailsStore(s => s.status)
	const setDetails = useProfileDetailsStore(s => s.setDetails)
	const setStatus = useProfileDetailsStore(s => s.setStatus)

	useEffect(() => {
		if (!activeUsername) return

		let cancelled = false
		const requestedFor = activeUsername

		const apply = (fn: () => void) => {
			if (cancelled) return
			// Если за время запроса сменили аккаунт — ответ отбрасываем.
			if (useAuthStore.getState().activeUsername !== requestedFor) return
			fn()
		}

		if (!getIsOnline()) {
			if (!details) setStatus('error')
			return () => {
				cancelled = true
			}
		}

		if (details) {
			// SWR: показываем кэш мгновенно, в фоне тихо ревалидируем
			// (нужно в основном чтобы подтянуть свежий photo_url).
			profileApi
				.getDetails()
				.then(d => apply(() => setDetails(d)))
				.catch(() => {})
			return () => {
				cancelled = true
			}
		}

		setStatus('loading')
		profileApi
			.getDetails()
			.then(d =>
				apply(() => {
					setDetails(d)
					setStatus('success')
				}),
			)
			.catch(() => apply(() => setStatus('error')))

		return () => {
			cancelled = true
		}
	}, [activeUsername])

	return { details, status }
}
