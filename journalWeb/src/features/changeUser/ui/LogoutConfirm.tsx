import { SheetButton } from '@/shared/ui'
import { LogOut } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
	onConfirm: () => void
	onCancel: () => void
}

export function LogoutConfirm({ onConfirm, onCancel }: Props) {
	useEffect(() => {
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [])

	return (
		<div
			className='fixed inset-0 flex items-end z-[200]'
			style={{ background: 'var(--color-modal-backdrop)', backdropFilter: 'blur(4px)' }}
			onClick={onCancel}
		>
			<div
				className='w-full rounded-t-[28px] p-5 space-y-3 border-t border-x border-app-border'
				style={{ background: 'var(--color-modal-bg)' }}
				onClick={e => e.stopPropagation()}
			>
				<div className='w-10 h-1 bg-glass-strong rounded-full mx-auto mb-2' />
				<div className='flex items-center gap-3 mb-1'>
					<div className='w-10 h-10 rounded-full bg-glass border border-glass-border flex items-center justify-center'>
						<LogOut size={18} className='text-app-muted' />
					</div>
					<div>
						<p className='text-sm font-semibold text-app-text'>
							Выйти из аккаунта?
						</p>
						<p className='text-xs text-app-muted mt-0.5'>
							Аккаунт будет удалён из списка
						</p>
					</div>
				</div>
				<SheetButton variant='danger' onClick={onConfirm}>
					Выйти
				</SheetButton>
				<SheetButton onClick={onCancel}>
					Отмена
				</SheetButton>
			</div>
		</div>
	)
}
