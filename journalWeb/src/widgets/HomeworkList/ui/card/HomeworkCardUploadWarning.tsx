import { Diamond } from 'lucide-react'

interface Props {
	onCancel: () => void
	onConfirm: () => void
}

export function HomeworkCardUploadWarning({ onCancel, onConfirm }: Props) {
	return (
		<div className='mt-3 p-3 bg-comment-subtle border border-comment-border rounded-2xl'>
			<div className='flex items-start gap-2 mb-3'>
				<Diamond
					size={16}
					className='text-status-comment flex-shrink-0 mt-0.5'
				/>
				<p className='text-sm text-app-text'>
					Повторная загрузка спишет{' '}
					<span className='font-bold text-status-comment'>2 💎</span>
				</p>
			</div>
			<div className='flex gap-2'>
				<button
					type='button'
					onClick={onCancel}
					className='flex-1 px-4 py-2 bg-app-surface hover:bg-app-surface-hover rounded-xl text-app-text text-sm transition-colors'
				>
					Отмена
				</button>
				<button
					type='button'
					onClick={onConfirm}
					className='flex-1 px-4 py-2 bg-status-comment hover:opacity-90 rounded-xl text-white text-sm font-medium transition-colors'
				>
					Продолжить
				</button>
			</div>
		</div>
	)
}
