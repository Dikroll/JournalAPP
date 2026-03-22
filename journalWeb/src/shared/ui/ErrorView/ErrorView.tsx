import { RefreshCw } from 'lucide-react'

interface Props {
	message?: string
	onRetry?: () => void
	className?: string
}

export function ErrorView({
	message = 'Ошибка загрузки',
	onRetry,
	className = '',
}: Props) {
	return (
		<div
			className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
		>
			<p className='text-status-overdue text-sm text-center'>{message}</p>
			{onRetry && (
				<button
					type='button'
					onClick={onRetry}
					className='flex items-center gap-2 px-4 py-2.5 bg-app-surface hover:bg-app-surface-hover rounded-2xl text-app-text text-sm border border-app-border transition-colors'
				>
					<RefreshCw size={15} />
					Повторить
				</button>
			)}
		</div>
	)
}
