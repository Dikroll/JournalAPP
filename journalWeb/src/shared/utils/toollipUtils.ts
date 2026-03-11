import { useRef, useState } from 'react'

export function useTooltipTimeout(ms = 2000) {
	const [visible, setVisible] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const resetTimer = () => {
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setVisible(false), ms)
	}

	const show = () => {
		setVisible(true)
		resetTimer()
	}

	const hide = () => {
		if (timer.current) clearTimeout(timer.current)
		setVisible(false)
	}

	return { visible, show, hide }
}
