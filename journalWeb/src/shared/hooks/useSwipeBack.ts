import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface Options {
	edgeWidth?: number
	minSwipeDistance?: number
	maxVerticalDrift?: number
	/** Отключить хук */
	disabled?: boolean
}

export function useSwipeBack({
	edgeWidth = 24,
	minSwipeDistance = 60,
	maxVerticalDrift = 60,
	disabled = false,
}: Options = {}) {
	const navigate = useNavigate()
	const startX = useRef<number | null>(null)
	const startY = useRef<number | null>(null)
	const active = useRef(false)

	useEffect(() => {
		if (disabled) return

		const onTouchStart = (e: TouchEvent) => {
			const touch = e.touches[0]
			if (!touch) return
			if (touch.clientX <= edgeWidth) {
				startX.current = touch.clientX
				startY.current = touch.clientY
				active.current = true
			}
		}

		const onTouchEnd = (e: TouchEvent) => {
			if (!active.current || startX.current === null || startY.current === null)
				return
			active.current = false

			const touch = e.changedTouches[0]
			if (!touch) return

			const dx = touch.clientX - startX.current
			const dy = Math.abs(touch.clientY - startY.current)

			if (dx >= minSwipeDistance && dy <= maxVerticalDrift) {
				navigate(-1)
			}

			startX.current = null
			startY.current = null
		}

		const onTouchCancel = () => {
			active.current = false
			startX.current = null
			startY.current = null
		}

		document.addEventListener('touchstart', onTouchStart, { passive: true })
		document.addEventListener('touchend', onTouchEnd, { passive: true })
		document.addEventListener('touchcancel', onTouchCancel, { passive: true })

		return () => {
			document.removeEventListener('touchstart', onTouchStart)
			document.removeEventListener('touchend', onTouchEnd)
			document.removeEventListener('touchcancel', onTouchCancel)
		}
	}, [disabled, edgeWidth, minSwipeDistance, maxVerticalDrift, navigate])
}
