import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shared scroll logic for horizontally scrollable tab bars.
 * Provides fade indicators on left/right edges and auto-scrolls the active tab into view.
 *
 * @param activeIndex - index of the currently active tab button
 */
export function useScrollableTabs(activeIndex: number) {
	const scrollRef = useRef<HTMLDivElement>(null)
	const [showLeft, setShowLeft] = useState(false)
	const [showRight, setShowRight] = useState(true)

	const checkFades = useCallback(() => {
		const el = scrollRef.current
		if (!el) return
		setShowLeft(el.scrollLeft > 8)
		setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
	}, [])

	useEffect(() => {
		checkFades()
		const el = scrollRef.current
		if (!el) return
		el.addEventListener('scroll', checkFades, { passive: true })
		return () => el.removeEventListener('scroll', checkFades)
	}, [checkFades])

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		const btns = el.querySelectorAll<HTMLButtonElement>('button')
		const btn = btns[activeIndex]
		if (!btn) return
		const left = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
		el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
	}, [activeIndex])

	return { scrollRef, showLeft, showRight }
}
