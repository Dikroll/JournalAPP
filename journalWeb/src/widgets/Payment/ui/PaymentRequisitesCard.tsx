interface RequisiteItem {
	label: string
	value: string
}

interface Props {
	requisites: RequisiteItem[]
}

export function PaymentRequisitesCard({ requisites }: Props) {
	if (!requisites.length) return null

	return (
		<div
			className='bg-app-surface rounded-[24px] border border-app-border p-4'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<p className='text-sm font-semibold text-app-text mb-3'>
				Реквизиты для оплаты
			</p>
			<div className='flex flex-col gap-3'>
				{requisites.map(r => (
					<div key={r.label}>
						<p className='text-[10px] text-app-muted mb-0.5'>{r.label}</p>
						<p className='text-xs text-app-text'>{r.value}</p>
					</div>
				))}
			</div>
		</div>
	)
}
