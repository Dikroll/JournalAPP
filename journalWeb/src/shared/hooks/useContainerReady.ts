import { useCallback, useRef, useState } from 'react'

export function useContainerReady() {
	const [ready, setReady] = useState(false)
	const observerRef = useRef<ResizeObserver | null>(null)

	const ref = useCallback((node: HTMLDivElement | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect()
			observerRef.current = null
		}
		if (!node) return

		const observer = new ResizeObserver(entries => {
			const width = entries[0]?.contentRect.width ?? 0
			if (width > 0) {
				setReady(true)
				observer.disconnect()
			}
		})
		observer.observe(node)
		observerRef.current = observer
	}, [])

	return { ref, ready }
}
