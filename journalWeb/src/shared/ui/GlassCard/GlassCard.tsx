import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode
}

/** Полупрозрачная подложка — одинаково выглядит на обеих темах */
export function GlassCard({ children, className = '', ...rest }: Props) {
	return (
		<div
			className={`bg-glass border border-glass-border rounded-2xl px-4 py-3 ${className}`}
			{...rest}
		>
			{children}
		</div>
	)
}
