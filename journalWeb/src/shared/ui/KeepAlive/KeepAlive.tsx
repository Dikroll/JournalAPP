import { useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface Props {
	children: ReactNode
	paths: string[]
}

export function KeepAlive({ children, paths }: Props) {
	const { pathname } = useLocation()
	const isActive = paths.some(p => pathname.startsWith(p))
	const mountedRef = useRef(false)

	if (isActive) mountedRef.current = true
	if (!mountedRef.current) return null

	return (
		<div style={{ display: isActive ? 'contents' : 'none' }}>{children}</div>
	)
}
