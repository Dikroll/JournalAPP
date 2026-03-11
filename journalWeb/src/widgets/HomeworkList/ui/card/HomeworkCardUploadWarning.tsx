import { Diamond } from 'lucide-react'

interface Props {
	onCancel: () => void
	onConfirm: () => void
}

export function HomeworkCardUploadWarning({ onCancel, onConfirm }: Props) {
	return (
		<div className='mt-3 p-3 bg-[#F29F05]/10 border border-[#F29F05]/30 rounded-2xl'>
			<div className='flex items-start gap-2 mb-3'>
				<Diamond size={16} className='text-[#F29F05] flex-shrink-0 mt-0.5' />
				<p className='text-sm text-[#F2F2F2]'>
					Повторная загрузка спишет{' '}
					<span className='font-bold text-[#F29F05]'>2 💎</span>
				</p>
			</div>
			<div className='flex gap-2'>
				<button
					type='button'
					onClick={onCancel}
					className='flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#F2F2F2] text-sm transition-colors'
				>
					Отмена
				</button>
				<button
					type='button'
					onClick={onConfirm}
					className='flex-1 px-4 py-2 bg-[#F29F05] hover:bg-[#F29F05]/90 rounded-xl text-white text-sm font-medium transition-colors'
				>
					Продолжить
				</button>
			</div>
		</div>
	)
}
