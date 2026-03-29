import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
	const { pathname } = useLocation()
	const prev = useRef(pathname)

	useEffect(() => {
		if (prev.current === pathname) return
		prev.current = pathname
		window.scrollTo(0, 0)
	}, [pathname])

	return null
}
