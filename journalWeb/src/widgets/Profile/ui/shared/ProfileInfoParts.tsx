export function Divider() {
	return <div className='h-px bg-app-border' />
}

interface InfoRowProps {
	icon: React.ReactNode
	label: string
	value: string
	badge?: React.ReactNode
}

export function InfoRow({ icon, label, value, badge }: InfoRowProps) {
	return (
		<div className='flex items-start gap-3 py-3'>
			<div className='mt-0.5 text-app-muted'>{icon}</div>
			<div className='flex-1 min-w-0'>
				<p className='text-[11px] text-app-muted mb-0.5'>{label}</p>
				<p className='text-sm font-medium text-app-text break-words'>{value}</p>
			</div>
			{badge && <div className='shrink-0 mt-0.5'>{badge}</div>}
		</div>
	)
}
