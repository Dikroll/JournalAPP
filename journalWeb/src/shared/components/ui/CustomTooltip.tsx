interface CustomTooltipProps {
	active?: boolean
	payload?: any[]
	label?: string
	suffix?: string
	visible?: boolean
}

export function CustomTooltip({
	active,
	payload,
	label,
	suffix,
	visible,
}: CustomTooltipProps) {
	const show = visible !== undefined ? active && visible : active
	if (!show || !payload?.length) return null

	return (
		<div
			style={{
				background: 'rgba(42,44,50,0.92)',
				backdropFilter: 'blur(12px)',
				border: '1px solid rgba(255,255,255,0.08)',
				borderRadius: '14px',
				padding: '8px 14px',
				minWidth: '80px',
				boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
				pointerEvents: 'none',
			}}
		>
			{label && (
				<p
					style={{
						color: '#6B7280',
						fontSize: '11px',
						marginBottom: '3px',
						whiteSpace: 'nowrap',
					}}
				>
					{label}
				</p>
			)}
			<p
				style={{
					color: '#F2F2F2',
					fontSize: '14px',
					fontWeight: 600,
					whiteSpace: 'nowrap',
				}}
			>
				{payload[0].value}
				{suffix ?? ''}
			</p>
		</div>
	)
}
