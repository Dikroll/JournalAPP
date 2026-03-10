import { useUserStore } from '@/entities/user'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../model/store'

export function LogoutButton() {
	const [open, setOpen] = useState(false)
	const logout = useAuthStore(s => s.logout)
	const clearUser = useUserStore(s => s.clearUser)
	const navigate = useNavigate()

	const confirm = () => {
		clearUser()
		logout()
		navigate('/login', { replace: true })
	}

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className='w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] bg-white/5 border border-white/8 text-[#9CA3AF] text-sm font-medium active:bg-white/10 transition-colors'
			>
				<LogOut size={16} />
				Выйти из аккаунта
			</button>

			{open && (
				<div
					className='fixed inset-0 flex items-end'
					style={{
						zIndex: 200,
						background: 'rgba(0,0,0,0.6)',
						backdropFilter: 'blur(4px)',
					}}
					onClick={() => setOpen(false)}
				>
					<div
						className='w-full rounded-t-[28px] p-6 space-y-3'
						style={{
							background: '#1A1C21',
							border: '1px solid rgba(255,255,255,0.08)',
						}}
						onClick={e => e.stopPropagation()}
					>
						<div className='w-10 h-1 bg-white/20 rounded-full mx-auto mb-4' />

						<div className='flex items-center gap-3 mb-2'>
							<div className='w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center'>
								<LogOut size={18} className='text-[#9CA3AF]' />
							</div>
							<div>
								<p className='text-sm font-semibold text-[#F2F2F2]'>
									Выйти из аккаунта?
								</p>
								<p className='text-xs text-[#6B7280] mt-0.5'>
									Вам потребуется снова войти
								</p>
							</div>
						</div>

						<button
							onClick={confirm}
							className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 active:bg-[#EF4444]/20 transition-colors'
						>
							Выйти
						</button>

						<button
							onClick={() => setOpen(false)}
							className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10 transition-colors'
						>
							Отмена
						</button>
					</div>
				</div>
			)}
		</>
	)
}
