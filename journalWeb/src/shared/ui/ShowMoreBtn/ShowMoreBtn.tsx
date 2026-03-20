import { ChevronDown, RefreshCw } from 'lucide-react'

interface Props {
	onClick: () => void
	isLoading?: boolean
	remaining?: number
	label?: string
}

export function ShowMoreBtn({
	onClick,
	isLoading = false,
	remaining,
	label,
}: Props) {
	const text =
		label ??
		(remaining != null ? `Показать ещё (${remaining}+)` : 'Показать ещё')
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={isLoading}
			className='w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-app-surface hover:bg-app-surface-hover border border-app-border rounded-2xl text-sm text-app-muted hover:text-app-text transition-colors disabled:opacity-50'
		>
			{isLoading ? (
				<>
					<RefreshCw size={14} className='animate-spin' />
					Загрузка...
				</>
			) : (
				<>
					<ChevronDown size={16} />
					{text}
				</>
			)}
		</button>
	)
}
