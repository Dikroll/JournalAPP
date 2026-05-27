import { getInitials } from '@/shared/utils/nameUtils'
import type { CSSProperties } from 'react'

interface Props {
	fullName: string
	photoUrl?: string | null
	size?: number | string
	className?: string
	style?: CSSProperties
}

export function Avatar({
	fullName,
	photoUrl,
	size = 40,
	className = '',
	style,
}: Props) {
	if (photoUrl) {
		return (
			<div
				className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-app-surface border border-app-border ${className}`}
				style={{ width: size, height: size, ...style }}
			>
				<img
					src={photoUrl}
					alt={fullName}
					className="w-full h-full object-cover"
				/>
			</div>
		)
	}

	return (
		<div
			className={`flex items-center justify-center rounded-full text-white font-bold select-none border border-app-border ${className}`}
			style={{
				width: size,
				height: size,
				fontSize: typeof size === 'number' ? size * 0.3 : '0.75rem',
				background: 'linear-gradient(135deg, var(--color-gradient-from) 0%, var(--color-gradient-to) 100%)',
				flexShrink: 0,
				...style,
			}}
		>
			{getInitials(fullName)}
		</div>
	)
}
