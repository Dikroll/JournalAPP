import { CheckCircle, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { clearCache } from '../hooks/useClearCache'

interface ClearCacheSheetProps {
	onClose: () => void
}

export function ClearCacheSheet({ onClose }: ClearCacheSheetProps) {
	const [done, setDone] = useState(false)

	const handleClear = useCallback(() => {
		clearCache()
		setDone(true)
	}, [])

	return (
		<div
			className='fixed inset-0 flex items-end z-[200]'
			style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
			onClick={done ? onClose : undefined}
		>
			<div
				className='w-full rounded-t-[28px] p-5 space-y-3'
				style={{
					background: '#1A1C21',
					border: '1px solid rgba(255,255,255,0.08)',
				}}
				onClick={e => e.stopPropagation()}
			>
				<div className='w-10 h-1 bg-white/20 rounded-full mx-auto mb-2' />

				{done ? (
					<div className='flex flex-col items-center gap-3 py-4'>
						<div className='w-12 h-12 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center'>
							<CheckCircle size={24} className='text-[#10B981]' />
						</div>
						<p className='text-sm font-semibold text-[#F2F2F2]'>Кэш очищен</p>
						<p className='text-xs text-[#6B7280] text-center'>
							Приложение сброшено к состоянию как при первой установке
						</p>
						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								onClose()
							}}
							onClick={onClose}
							className='w-full mt-2 py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10'
							style={{
								WebkitTapHighlightColor: 'transparent',
							}}
						>
							Закрыть
						</button>
					</div>
				) : (
					<>
						<div className='flex items-center gap-3 mb-1'>
							<div className='w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center'>
								<Trash2 size={18} className='text-[#9CA3AF]' />
							</div>
							<div>
								<p className='text-sm font-semibold text-[#F2F2F2]'>
									Очистить кэш приложения?
								</p>
								<p className='text-xs text-[#6B7280] mt-0.5'>
									Все данные, настройки и кэш будут сброшены к состоянию как при
									первой установке
								</p>
							</div>
						</div>

						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								handleClear()
							}}
							onClick={handleClear}
							className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 active:bg-[#EF4444]/20'
							style={{
								WebkitTapHighlightColor: 'transparent',
							}}
						>
							Очистить
						</button>

						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								onClose()
							}}
							onClick={onClose}
							className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10'
							style={{
								WebkitTapHighlightColor: 'transparent',
							}}
						>
							Отмена
						</button>
					</>
				)}
			</div>
		</div>
	)
}
