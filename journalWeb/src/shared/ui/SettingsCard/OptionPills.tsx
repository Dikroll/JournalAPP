export interface PillOption<T extends string | number> {
	value: T
	label: string
}

interface Props<T extends string | number> {
	label?: string
	options: readonly PillOption<T>[]
	selected: T
	onSelect: (value: T) => void
}

export function OptionPills<T extends string | number>({
	label,
	options,
	selected,
	onSelect,
}: Props<T>) {
	return (
		<div className='flex items-center gap-2'>
			{label && (
				<span className='text-[11px] text-app-faint flex-shrink-0'>{label}</span>
			)}
			<div className='flex flex-1 gap-1.5'>
				{options.map(opt => {
					const active = opt.value === selected
					return (
						<button
							key={String(opt.value)}
							type='button'
							onClick={() => onSelect(opt.value)}
							className='flex-1 py-2 rounded-xl text-xs font-medium transition-colors min-h-[36px]'
							style={{
								background: active
									? 'var(--color-brand)'
									: 'var(--color-surface-strong)',
								color: active ? '#fff' : 'var(--color-text-muted)',
								border: active
									? '1px solid var(--color-brand-border)'
									: '1px solid var(--color-border)',
								WebkitTapHighlightColor: 'transparent',
							}}
						>
							{opt.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
