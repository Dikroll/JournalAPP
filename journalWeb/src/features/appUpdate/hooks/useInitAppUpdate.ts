// journalWeb/src/features/appUpdate/hooks/useInitAppUpdate.ts
//
// Вызывается один раз при старте в App.tsx.
// Проверяет обновление с задержкой 3 секунды —
// чтобы не конкурировать с useInitUser и загрузкой главной страницы.

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
