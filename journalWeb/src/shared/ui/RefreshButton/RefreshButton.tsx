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
				'flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] text-sm border border-white/10 transition-colors disabled:opacity-50'
			}
		>
			<RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
			Обновить
		</button>
	)
}
