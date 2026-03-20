import { useUserStore } from '@/entities/user'
import { useAuthStore, type SavedAccount } from '@/features/auth/model/store'
import { useSwitchUser } from '@/features/changeUser/hooks/useSwitchUser'
import { LogOut, Plus, RefreshCw, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
	onClose: () => void
	onAddAccount: () => void
	onReset: () => void
}

interface AccountRowProps {
	account: SavedAccount
	isActive: boolean
	isSwitching: boolean
	onSwitch: () => void
	onRemove: () => void
}

function AccountRow({
	account,
	isActive,
	isSwitching,
	onSwitch,
	onRemove,
}: AccountRowProps) {
	return (
		<div
			className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
				isActive
					? 'bg-white/10 border border-white/15'
					: 'bg-white/5 border border-white/8 hover:bg-white/8 cursor-pointer active:bg-white/10'
			}`}
			onClick={!isActive && !isSwitching ? onSwitch : undefined}
		>
			<div className='w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center'>
				{account.avatarUrl ? (
					<img
						src={account.avatarUrl}
						alt={account.fullName}
						className='w-full h-full object-cover'
					/>
				) : (
					<UserRound size={18} className='text-[#9CA3AF]' />
				)}
			</div>

			<div className='flex-1 min-w-0'>
				<p className='text-sm font-medium text-[#F2F2F2] truncate'>
					{account.fullName}
				</p>
				<p className='text-xs text-[#6B7280] truncate'>{account.groupName}</p>
			</div>

			{isSwitching ? (
				<RefreshCw
					size={14}
					className='text-[#9CA3AF] animate-spin flex-shrink-0'
				/>
			) : isActive ? (
				<span className='text-[10px] text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-full flex-shrink-0'>
					Активен
				</span>
			) : (
				<button
					type='button'
					onClick={e => {
						e.stopPropagation()
						onRemove()
					}}
					className='p-1.5 rounded-full hover:bg-white/10 text-[#6B7280] hover:text-[#EF4444] transition-colors flex-shrink-0'
				>
					<Trash2 size={13} />
				</button>
			)}
		</div>
	)
}

function LogoutConfirm({
	onConfirm,
	onCancel,
}: {
	onConfirm: () => void
	onCancel: () => void
}) {
	return (
		<div
			className='fixed inset-0 flex items-end z-200'
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
					onClick={onConfirm}
					className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 active:bg-[#EF4444]/20 transition-colors'
				>
					Выйти
				</button>
				<button
					type='button'
					onClick={onCancel}
					className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10 transition-colors'
				>
					Отмена
				</button>
			</div>
		</div>
	)
}

export function AccountSwitcher({ onClose, onAddAccount, onReset }: Props) {
	const accounts = useAuthStore(s => s.accounts)
	const activeUsername = useAuthStore(s => s.activeUsername)
	const removeAccount = useAuthStore(s => s.removeAccount)
	const logout = useAuthStore(s => s.logout)
	const clearUser = useUserStore(s => s.clearUser)
	const navigate = useNavigate()
	const { switchTo, switching } = useSwitchUser(onReset)
	const [switchingTo, setSwitchingTo] = useState<string | null>(null)
	const [confirmLogout, setConfirmLogout] = useState(false)

	const handleSwitch = async (username: string) => {
		if (switching) return
		setSwitchingTo(username)
		await switchTo(username)
		setSwitchingTo(null)
		onClose()
	}

	const handleRemove = (username: string) => {
		const isActive = username === activeUsername

		if (isActive) {
			const remainingAccounts = useAuthStore
				.getState()
				.accounts.filter(a => a.username !== username)
			removeAccount(username)
			onReset()
			clearUser()
			logout()
			onClose()
			if (remainingAccounts.length === 0) {
				navigate('/login', { replace: true })
			}
		} else {
			removeAccount(username)
		}
	}

	const handleLogout = () => {
		const remainingAccounts = useAuthStore
			.getState()
			.accounts.filter(a => a.username !== activeUsername)
		onReset()
		clearUser()
		logout()
		onClose()
		if (remainingAccounts.length === 0) {
			navigate('/login', { replace: true })
		}
	}

	if (confirmLogout) {
		return (
			<LogoutConfirm
				onConfirm={handleLogout}
				onCancel={() => setConfirmLogout(false)}
			/>
		)
	}

	return (
		<div
			className='fixed inset-0 flex items-end z-200'
			style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
			onClick={onClose}
		>
			<div
				className='w-full rounded-t-[28px] p-5 space-y-3'
				style={{
					background: '#1A1C21',
					border: '1px solid rgba(255,255,255,0.08)',
					maxHeight: '80dvh',
					overflowY: 'auto',
				}}
				onClick={e => e.stopPropagation()}
			>
				<div className='w-10 h-1 bg-white/20 rounded-full mx-auto mb-2' />
				<p className='text-sm font-semibold text-[#F2F2F2] mb-3'>Аккаунты</p>

				<div className='space-y-2'>
					{accounts.map(account => (
						<AccountRow
							key={account.username}
							account={account}
							isActive={account.username === activeUsername}
							isSwitching={switchingTo === account.username}
							onSwitch={() => handleSwitch(account.username)}
							onRemove={() => handleRemove(account.username)}
						/>
					))}
				</div>

				{accounts.length < 5 && (
					<button
						type='button'
						onClick={() => {
							onClose()
							onAddAccount()
						}}
						className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/8 text-[#9CA3AF] text-sm hover:bg-white/8 transition-colors'
					>
						<Plus size={15} />
						Добавить аккаунт
					</button>
				)}

				<button
					type='button'
					onClick={() => setConfirmLogout(true)}
					className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/15 transition-colors'
				>
					<LogOut size={15} />
					Выйти из аккаунта
				</button>
			</div>
		</div>
	)
}
