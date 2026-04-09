import { BottomSheet, SuccessStateView } from '@/shared/ui'
import { Trash2 } from 'lucide-react'
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
		<BottomSheet onBackdropClick={done ? onClose : undefined} zIndex={200}>
			{done ? (
				<div className='space-y-3'>
					<SuccessStateView
						title='Кэш очищен'
						subtitle='Приложение сброшено к состоянию как при первой установке'
					/>
					<button
						type='button'
						onClick={onClose}
						className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10'
						style={{ WebkitTapHighlightColor: 'transparent' }}
					>
						Закрыть
					</button>
				</div>
			) : (
				<div className='space-y-3'>
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
						onClick={handleClear}
						className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 active:bg-[#EF4444]/20'
						style={{ WebkitTapHighlightColor: 'transparent' }}
					>
						Очистить
					</button>

					<button
						type='button'
						onClick={onClose}
						className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10'
						style={{ WebkitTapHighlightColor: 'transparent' }}
					>
						Отмена
					</button>
				</div>
			)}
		</BottomSheet>
	)
}
