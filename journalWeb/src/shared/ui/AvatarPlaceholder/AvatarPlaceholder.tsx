import { getInitials } from '@/shared/utils/nameUtils'
import type { CSSProperties } from 'react'

interface Props {
	fullName: string
	size?: number
	className?: string
	style?: CSSProperties
}

export function AvatarPlaceholder({
	fullName,
	size = 40,
	className = '',
	style,
}: Props) {
	return (
		<div
			className={`flex items-center justify-center rounded-full text-white font-bold select-none ${className}`}
			style={{
				width: size,
				height: size,
				fontSize: size * 0.3,
				background: 'linear-gradient(135deg, var(--color-gradient-from) 0%, var(--color-gradient-to) 100%)',
				flexShrink: 0,
				...style,
			}}
		>
			{getInitials(fullName)}
		</div>
	)
}
