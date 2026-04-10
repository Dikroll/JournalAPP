import { useEffect, useRef, useState } from 'react'

export function useTooltipDismiss(hideDelay = 1500) {
	const [active, setActive] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearTimer = () => {
		if (timer.current) {
			clearTimeout(timer.current)
			timer.current = null
		}
	}

	const show = () => {
		clearTimer()
		setActive(true)
	}

	const hideAfterDelay = () => {
		clearTimer()
		timer.current = setTimeout(() => setActive(false), hideDelay)
	}

	// Hide tooltip on scroll — covers swipe-away, page scroll, etc.
	useEffect(() => {
		if (!active) return

		const onScroll = () => {
			clearTimer()
			setActive(false)
		}

		// capture: true catches scroll on any ancestor
		window.addEventListener('scroll', onScroll, { capture: true, passive: true })
		return () => window.removeEventListener('scroll', onScroll, { capture: true })
	}, [active])

	const handlers = {
		onTouchStart: show,
		onTouchEnd: hideAfterDelay,
		onMouseEnter: show,
		onMouseLeave: () => {
			clearTimer()
			setActive(false)
		},
	}

	return { active, handlers }
}
