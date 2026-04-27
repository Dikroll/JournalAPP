import type { ReactNode } from 'react'

interface Props {
	title: string
	children: ReactNode
}

export function SectionCard({ title, children }: Props) {
	return (
		<div className='space-y-2'>
			<p className='text-xs font-semibold text-app-muted uppercase tracking-wider px-1'>
				{title}
			</p>
			<div
				className='rounded-[20px] overflow-hidden'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				{children}
			</div>
		</div>
	)
}
