import { BottomSheet, SheetButton, SuccessStateView } from '@/shared/ui'
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
					<SheetButton onClick={onClose}>Закрыть</SheetButton>
				</div>
			) : (
				<div className='space-y-3'>
					<div className='flex items-center gap-3 mb-1'>
						<div className='w-10 h-10 rounded-full bg-glass border border-glass-border flex items-center justify-center'>
							<Trash2 size={18} className='text-app-muted' />
						</div>
						<div>
							<p className='text-sm font-semibold text-app-text'>
								Очистить кэш приложения?
							</p>
							<p className='text-xs text-app-muted mt-0.5'>
								Все данные, настройки и кэш будут сброшены к состоянию как при
								первой установке
							</p>
						</div>
					</div>

					<SheetButton variant='danger' onClick={handleClear}>
						Очистить
					</SheetButton>
					<SheetButton onClick={onClose}>Отмена</SheetButton>
				</div>
			)}
		</BottomSheet>
	)
}
