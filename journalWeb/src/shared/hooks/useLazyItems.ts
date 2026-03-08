import { useEffect, useRef, useState } from 'react'

export function useLazyItems(total: number, initialCount = 15, step = 10) {
	const [visibleCount, setVisibleCount] = useState(() =>
		Math.min(initialCount, total),
	)
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		setVisibleCount(Math.min(initialCount, total))
	}, [total, initialCount])

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel) return

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0]?.isIntersecting) {
					setVisibleCount(prev => Math.min(prev + step, total))
				}
			},
			{ rootMargin: '200px' },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [total, step])

	return { visibleCount, sentinelRef }
}
