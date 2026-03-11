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
				backdropFilter: 'blur(16px)',
				border: '1px solid rgba(255,255,255,0.10)',
				borderRadius: '12px',
				padding: '6px 12px',
				minWidth: '64px',
				boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
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
