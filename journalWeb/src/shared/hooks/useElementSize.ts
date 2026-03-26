import { useCallback, useRef, useState } from 'react'

export function useElementSize() {
	const [size, setSize] = useState({ width: 0, height: 0 })
	const observerRef = useRef<ResizeObserver | null>(null)

	const ref = useCallback((node: HTMLDivElement | null) => {
		observerRef.current?.disconnect()
		observerRef.current = null
		if (!node) return

		const observer = new ResizeObserver(entries => {
			const rect = entries[0]?.contentRect
			if (rect)
				setSize({
					width: Math.floor(rect.width),
					height: Math.floor(rect.height),
				})
		})
		observer.observe(node)
		observerRef.current = observer
	}, [])

	return { ref, ...size }
}
