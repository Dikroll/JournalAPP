import { timing } from '@/shared/config'
import { useEffect, useRef } from 'react'
import { useAppUpdate } from './useAppUpdate'

export function useInitAppUpdate() {
	const { checkForUpdate } = useAppUpdate()
	const checked = useRef(false)

	useEffect(() => {
		if (checked.current) return
		checked.current = true

		const timer = setTimeout(checkForUpdate, timing.APP_UPDATE_CHECK_DELAY)
		return () => clearTimeout(timer)
	}, [])
}
