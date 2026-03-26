import type { CSSProperties } from 'react'

interface Props {
	fullName: string
	size?: number
	className?: string
	style?: CSSProperties
}

function getInitials(fullName: string): string {
	return fullName
		.split(' ')
		.map(n => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()
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
				background: 'linear-gradient(135deg, #F20519 0%, #F29F05 100%)',
				flexShrink: 0,
				...style,
			}}
		>
			{getInitials(fullName)}
		</div>
	)
}
