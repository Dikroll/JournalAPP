interface Props {
	children: React.ReactNode
	onClick?: () => void
	disabled?: boolean
	variant?: 'primary' | 'secondary' | 'danger'
}

const styles = {
	primary:
		'text-white font-semibold',
	secondary:
		'text-app-muted font-medium bg-glass border border-glass-border active:bg-glass-active',
	danger:
		'text-danger font-semibold bg-danger-subtle border border-danger-border active:bg-danger-subtle',
} as const

/** Кнопка для BottomSheet / модалок — primary, secondary, danger */
export function SheetButton({
	children,
	onClick,
	disabled,
	variant = 'secondary',
}: Props) {
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={disabled}
			className={`w-full py-3.5 rounded-[18px] text-sm disabled:opacity-50 ${styles[variant]}`}
			style={
				variant === 'primary'
					? {
							background:
								'linear-gradient(90deg, var(--color-brand), var(--color-brand-hover))',
						}
					: { WebkitTapHighlightColor: 'transparent' }
			}
		>
			{children}
		</button>
	)
}
