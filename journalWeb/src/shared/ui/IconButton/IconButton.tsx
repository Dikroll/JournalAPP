import type { ReactNode, SyntheticEvent } from 'react'

type IconButtonSize = 'sm' | 'md'
type IconButtonShape = 'round' | 'square'
type IconButtonVariant = 'overlay' | 'surface'

interface IconButtonProps {
	icon: ReactNode
	onClick?: (e: SyntheticEvent) => void
	size?: IconButtonSize
	shape?: IconButtonShape
	variant?: IconButtonVariant
	disabled?: boolean
	type?: 'button' | 'submit'
	className?: string
	style?: React.CSSProperties
	'aria-label'?: string
}

const sizeStyles: Record<IconButtonSize, string> = {
	sm: 'w-8 h-8',
	md: 'w-9 h-9',
}

const shapeStyles: Record<IconButtonShape, string> = {
	round: 'rounded-full',
	square: 'rounded-[14px]',
}

const variantStyles: Record<IconButtonVariant, string> = {
	overlay:
		'bg-white/5 border border-white/10 text-[#6B7280] hover:text-[#F2F2F2] hover:bg-white/10',
	surface:
		'bg-app-surface border border-app-border text-app-muted active:scale-95 transition-transform',
}

export function IconButton({
	icon,
	onClick,
	size = 'sm',
	shape = 'round',
	variant = 'overlay',
	disabled,
	type = 'button',
	className,
	style,
	'aria-label': ariaLabel,
}: IconButtonProps) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel}
			style={{ WebkitTapHighlightColor: 'transparent', ...style }}
			className={`flex items-center justify-center disabled:opacity-40 ${sizeStyles[size]} ${shapeStyles[shape]} ${variantStyles[variant]} ${className ?? ''}`}
		>
			{icon}
		</button>
	)
}
