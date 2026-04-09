// journalWeb/src/features/appUpdate/hooks/useInitAppUpdate.ts
//
// Вызывается один раз при старте в App.tsx.
// Проверяет обновление с задержкой 3 секунды —
// чтобы не конкурировать с useInitUser и загрузкой главной страницы.

import { useEffect, useRef } from 'react'
import { useAppUpdate } from './useAppUpdate'

export function useInitAppUpdate() {
	const { checkForUpdate } = useAppUpdate()
	const checked = useRef(false)

	useEffect(() => {
		if (checked.current) return
		checked.current = true

		// Небольшая задержка — даём приложению прогрузиться
		const timer = setTimeout(() => {
			checkForUpdate()
		}, 3000)

		return () => clearTimeout(timer)
	}, [])
}
