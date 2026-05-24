import { useCallback, useRef, useState } from 'react'

export function useElementSize() {
	const [size, setSize] = useState({ width: 0, height: 0 })
	const observerRef = useRef<ResizeObserver | null>(null)

	const ref = useCallback((node: HTMLDivElement | null) => {
		observerRef.current?.disconnect()
		observerRef.current = null
		if (!node) return

		const observer = new ResizeObserver(entries => {
			const r = entries[0]?.contentRect
			if (r) setSize({ width: Math.floor(r.width), height: Math.floor(r.height) })
		})
		observer.observe(node)
		observerRef.current = observer
	}, [])

	return { ref, ...size }
}
