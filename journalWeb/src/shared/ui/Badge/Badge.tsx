import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'error' | 'neutral' | 'brand' | 'new'
type BadgeSize = 'xs' | 'sm'

interface BadgeProps {
	children: ReactNode
	variant?: BadgeVariant
	size?: BadgeSize
	icon?: ReactNode
	className?: string
	style?: React.CSSProperties
}

const variantStyles: Record<BadgeVariant, { className: string; style?: React.CSSProperties }> = {
	success: { className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' },
	error: { className: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' },
	neutral: {
		className: 'border',
		style: {
			background: 'var(--color-surface-strong)',
			color: 'var(--color-text-muted)',
			borderColor: 'var(--color-border)',
		},
	},
	brand: {
		className: 'border',
		style: {
			background: 'var(--color-brand-subtle)',
			color: 'var(--color-brand)',
			borderColor: 'var(--color-brand-border)',
		},
	},
	new: {
		className: 'border',
		style: {
			background: 'var(--color-new-subtle)',
			color: 'var(--color-new)',
			borderColor: 'var(--color-new-border)',
		},
	},
}

const sizeStyles: Record<BadgeSize, string> = {
	xs: 'text-[10px] font-semibold px-1.5 py-0.5',
	sm: 'text-[11px] font-medium px-2 py-0.5',
}

export function Badge({
	children,
	variant = 'neutral',
	size = 'sm',
	icon,
	className,
	style,
}: BadgeProps) {
	const v = variantStyles[variant]
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full ${sizeStyles[size]} ${v.className} ${className ?? ''}`}
			style={{ ...v.style, ...style }}
		>
			{icon}
			{children}
		</span>
	)
}
