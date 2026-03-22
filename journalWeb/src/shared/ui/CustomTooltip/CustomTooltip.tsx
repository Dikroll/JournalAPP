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
				background: 'rgba(28,30,36,0.97)',
				backdropFilter: 'var(--blur-card)',
				WebkitBackdropFilter: 'var(--blur-card)',
				border: '1px solid rgba(255,255,255,0.10)',
				borderRadius: '12px',
				padding: '6px 12px',
				minWidth: '64px',
				boxShadow: 'var(--shadow-tooltip)',
				pointerEvents: 'none',
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
}
