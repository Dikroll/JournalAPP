import { RefreshCw } from 'lucide-react'

interface Props {
	isRefreshing: boolean
	onRefresh: () => void
}

export function GradesHeader({ isRefreshing, onRefresh }: Props) {
	return (
		<div className='flex items-center justify-between'>
			<h1 className='text-2xl font-bold'>Оценки</h1>
			<button
				type='button'
				onClick={onRefresh}
				className='flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] text-sm border border-white/10 transition-colors'
			>
				<RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
				Обновить
			</button>
		</div>
	)
}
