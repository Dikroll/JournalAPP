import { LogOut } from 'lucide-react'

interface Props {
	onConfirm: () => void
	onCancel: () => void
}

export function LogoutConfirm({ onConfirm, onCancel }: Props) {
	return (
		<div
			className='fixed inset-0 flex items-end z-[200]'
			style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
			onClick={onCancel}
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
				<div className='flex items-center gap-3 mb-1'>
					<div className='w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center'>
						<LogOut size={18} className='text-[#9CA3AF]' />
					</div>
					<div>
						<p className='text-sm font-semibold text-[#F2F2F2]'>
							Выйти из аккаунта?
						</p>
						<p className='text-xs text-[#6B7280] mt-0.5'>
							Аккаунт будет удалён из списка
						</p>
					</div>
				</div>
				<button
					type='button'
					onClick={e => {
						e.preventDefault()
						onConfirm()
					}}
					className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 active:bg-[#EF4444]/20'
				>
					Выйти
				</button>
				<button
					type='button'
					onClick={e => {
						e.preventDefault()
						onCancel()
					}}
					className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10'
				>
					Отмена
				</button>
			</div>
		</div>
	)
}
