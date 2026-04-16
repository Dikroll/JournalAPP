import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect } from 'react'
import { profileApi } from '../api/index'
import { useProfileDetailsStore } from '../model/store'

export function useProfileDetails() {
	const details = useProfileDetailsStore(s => s.details)
	const status = useProfileDetailsStore(s => s.status)
	const setDetails = useProfileDetailsStore(s => s.setDetails)
	const setStatus = useProfileDetailsStore(s => s.setStatus)

	useEffect(() => {
		if (details) return

		if (!getIsOnline()) {
			setStatus('error')
			return
		}

		setStatus('loading')
		profileApi
			.getDetails()
			.then(d => {
				setDetails(d)
				setStatus('success')
			})
			.catch(() => {
				if (!details) setStatus('error')
			})
	}, [])

	return { details, status }
}
