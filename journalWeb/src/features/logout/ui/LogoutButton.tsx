import { BottomSheet, SheetButton } from '@/shared/ui'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useLogout } from '../hooks/useLogout'

interface Props {
	onBeforeLogout?: () => void
}

export function LogoutButton({ onBeforeLogout }: Props) {
	const { logout, loading } = useLogout()
	const [open, setOpen] = useState(false)

	const handleOpen = () => {
		setOpen(true)
	}

	const handleClose = () => {
		if (loading) return
		setOpen(false)
	}

	const handleConfirm = async () => {
		onBeforeLogout?.()
		await logout()
	}

	return (
		<>
			<button
				onClick={e => {
					e.preventDefault()
					handleOpen()
				}}
				className='w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] bg-glass border border-glass-border text-app-muted text-sm font-medium active:bg-glass-active'
			>
				<LogOut size={16} />
				Выход
			</button>

			{open && (
				<BottomSheet onBackdropClick={handleClose} zIndex={300}>
					<div className='space-y-4'>
						<h2 className='text-app-text text-lg font-semibold'>
							Вы уверены?
						</h2>
						<p className='text-app-muted text-sm'>
							Вы будете вышвырнуты из системы и сможете войти снова с
							другим аккаунтом.
						</p>
						<div className='flex gap-3 pt-2'>
							<div className='flex-1'>
								<SheetButton onClick={handleClose} disabled={loading}>
									Отмена
								</SheetButton>
							</div>
							<div className='flex-1'>
								<SheetButton variant='danger' onClick={handleConfirm} disabled={loading}>
									{loading ? 'Выход...' : 'Выход'}
								</SheetButton>
							</div>
						</div>
					</div>
				</BottomSheet>
			)}
		</>
	)
}
