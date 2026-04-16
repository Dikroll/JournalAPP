import { RefreshCw } from 'lucide-react'

interface Props {
	isRefreshing: boolean
	onRefresh: () => void
	disabled?: boolean
	className?: string
}

export function RefreshButton({
	isRefreshing,
	onRefresh,
	disabled,
	className,
}: Props) {
	return (
		<button
			type='button'
			onClick={onRefresh}
			disabled={isRefreshing || disabled}
			className={
				className ??
				'flex items-center gap-1.5 px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text)] hover:text-[var(--color-text)] text-sm disabled:opacity-50'
			}
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
			Обновить
		</button>
	)
}
