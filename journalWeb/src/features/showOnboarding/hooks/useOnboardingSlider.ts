import { useCallback, useRef, useState } from 'react'

export function useOnboardingSlider(slidesCount: number, onDone: () => void) {
	const [current, setCurrent] = useState(0)
	const isLast = current === slidesCount - 1
	const touchStartX = useRef<number | null>(null)
	const touchEndX = useRef<number | null>(null)

	const handleNext = useCallback(() => {
		if (isLast) onDone()
		else setCurrent(c => c + 1)
	}, [isLast, onDone])

	const handlePrev = useCallback(() => {
		if (current > 0) setCurrent(c => c - 1)
	}, [current])

	const handleSwipe = useCallback(
		(direction: 'left' | 'right') => {
			if (direction === 'left') handleNext()
			else if (direction === 'right') handlePrev()
		},
		[handleNext, handlePrev],
	)

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.targetTouches[0].clientX
	}, [])

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			touchEndX.current = e.changedTouches[0].clientX
			const distance = touchStartX.current! - touchEndX.current!
			const isLeftSwipe = distance > 50
			const isRightSwipe = distance < -50

			if (isLeftSwipe) handleSwipe('left')
			else if (isRightSwipe) handleSwipe('right')
		},
		[handleSwipe],
	)

	const goToSlide = useCallback(
		(index: number) => {
			if (index >= 0 && index < slidesCount) setCurrent(index)
		},
		[slidesCount],
	)

	return {
		current,
		isLast,
		handleNext,
		handlePrev,
		handleSwipe,
		handleTouchStart,
		handleTouchEnd,
		goToSlide,
	}
}
