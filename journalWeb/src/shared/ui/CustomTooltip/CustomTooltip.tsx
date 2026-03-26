import React from 'react'
import { createPortal } from 'react-dom'

interface CustomTooltipProps {
	active?: boolean
	payload?: any[]
	label?: string
	suffix?: string
	containerRef?: React.RefObject<HTMLElement | null>
	position?: { x?: number; y?: number }
	coordinate?: { x?: number; y?: number }
}

export function CustomTooltip({
	active,
	payload,
	label,
	suffix,
	containerRef,
	position,
	coordinate,
}: CustomTooltipProps) {
	if (!active || !payload?.length) return null

	const baseX = position?.x ?? coordinate?.x ?? 0
	const baseY = position?.y ?? coordinate?.y ?? 0
	const parentRect = containerRef?.current?.getBoundingClientRect()
	const x = (parentRect?.left ?? 0) + baseX
	const y = (parentRect?.top ?? 0) + baseY

	const tooltipWidth = 140
	const safeX = Math.min(
		Math.max(x, 8 + tooltipWidth / 2),
		(window?.innerWidth ?? 0) - 8 - tooltipWidth / 2,
	)
	const tooltipNode = (
		<div
			style={{
				position: 'fixed',
				left: safeX,
				top: y - 10,
				transform: 'translateX(-50%)',
				background: 'rgba(22, 23, 28, 0.96)',
				backdropFilter: 'blur(12px)',
				WebkitBackdropFilter: 'blur(12px)',
				border: '1px solid rgba(255,255,255,0.10)',
				borderRadius: '12px',
				padding: '6px 12px',
				minWidth: '64px',
				boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
				pointerEvents: 'none',
				zIndex: 9999,
			}}
		>
			{label && (
				<p
					style={{
						color: '#6B7280',
						fontSize: '10px',
						marginBottom: '2px',
						whiteSpace: 'nowrap',
					}}
				>
					{label}
				</p>
			)}
			<p
				style={{
					color: '#F2F2F2',
					fontSize: '13px',
					fontWeight: 600,
					whiteSpace: 'nowrap',
				}}
			>
				{payload[0].value}
				{suffix ?? ''}
			</p>
		</div>
	)

	if (typeof document === 'undefined') return tooltipNode
	return createPortal(tooltipNode, document.body)
}
