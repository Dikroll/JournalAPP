import { useEffect, useRef, useState } from 'react'

interface CustomTooltipProps {
	active?: boolean
	payload?: any[]
	label?: string
	suffix?: string
}

export function CustomTooltip({
	active,
	payload,
	label,
	suffix,
}: CustomTooltipProps) {
	const [hidden, setHidden] = useState(false)
	const prevActive = useRef(false)

	useEffect(() => {
		if (active && !prevActive.current) setHidden(false)
		prevActive.current = !!active
	}, [active])

	useEffect(() => {
		if (!active || hidden) return
		const hide = () => setHidden(true)
		window.addEventListener('scroll', hide, { capture: true, passive: true })
		return () => window.removeEventListener('scroll', hide, { capture: true })
	}, [active, hidden])

	if (!active || hidden || !payload?.length) return null

	return (
		<div
			style={{
				background: 'rgba(22, 23, 28, 0.96)',
				backdropFilter: 'blur(12px)',
				WebkitBackdropFilter: 'blur(12px)',
				border: '1px solid rgba(255,255,255,0.10)',
				borderRadius: '12px',
				padding: '6px 12px',
				minWidth: '64px',
				boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
				pointerEvents: 'none',
				whiteSpace: 'nowrap',
			}}
		>
			{label && (
				<p style={{ color: '#6B7280', fontSize: '10px', marginBottom: '2px' }}>
					{label}
				</p>
			)}
			<p style={{ color: '#F2F2F2', fontSize: '13px', fontWeight: 600 }}>
				{payload[0].value}
				{suffix ?? ''}
			</p>
		</div>
	)
}
