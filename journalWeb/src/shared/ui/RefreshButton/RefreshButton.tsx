import { RefreshCw } from 'lucide-react'

interface Props {
	isRefreshing: boolean
	onRefresh: () => void
	className?: string
}

export function RefreshButton({ isRefreshing, onRefresh, className }: Props) {
	return (
		<button
			type='button'
			onClick={onRefresh}
			disabled={isRefreshing}
			className={
				className ??
				'flex items-center gap-1.5 px-3 py-2 bg-app-surface-strong hover:bg-app-surface-active border border-app-border-strong rounded-2xl text-app-muted hover:text-app-text text-sm transition-colors disabled:opacity-50'
			}
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
			Обновить
		</button>
	)
}
