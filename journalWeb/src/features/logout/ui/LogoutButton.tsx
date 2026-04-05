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
				className='w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] bg-white/5 border border-white/8 text-[#9CA3AF] text-sm font-medium active:bg-white/10'
			>
				<LogOut size={16} />
				Выход
			</button>

			{open && (
				<div
					className='fixed inset-0 flex items-center justify-center z-[300]'
					style={{
						background: 'rgba(0,0,0,0.7)',
						backdropFilter: 'blur(4px)',
					}}
					onClick={handleClose}
				>
					<div
						className='bg-[#1A1C21] rounded-[20px] p-6 space-y-4 max-w-sm w-full mx-4 border border-white/8'
						onClick={e => e.stopPropagation()}
					>
						<h2 className='text-white text-lg font-semibold'>
							Вы уверены?
						</h2>
						<p className='text-[#9CA3AF] text-sm'>
							Вы будете вышвырнуты из системы и сможете войти снова с
							другим аккаунтом.
						</p>
						<div className='flex gap-3 pt-2'>
							<button
								onClick={handleClose}
								disabled={loading}
								className='flex-1 py-2.5 rounded-[12px] bg-white/5 border border-white/8 text-white font-medium disabled:opacity-50'
							>
								Отмена
							</button>
							<button
								onClick={handleConfirm}
								disabled={loading}
								className='flex-1 py-2.5 rounded-[12px] bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 disabled:opacity-50'
							>
								{loading ? 'Выход...' : 'Выход'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
