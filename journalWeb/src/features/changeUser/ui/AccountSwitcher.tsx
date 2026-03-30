import { LogOut, Plus } from 'lucide-react'
import { useAccountSwitcher } from '../hooks/useAccountSwitcher'
import { AccountRow } from './AccountRow'
import { LogoutConfirm } from './LogoutConfirm'
interface Props {
	onClose: () => void
	onAddAccount: () => void
	onReset: () => void
}

export function AccountSwitcher({ onClose, onAddAccount, onReset }: Props) {
	const {
		accounts,
		activeUsername,
		switchingTo,
		confirmLogout,
		setConfirmLogout,
		handleSwitch,
		handleRemove,
		handleLogout,
	} = useAccountSwitcher(onReset, onClose)

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
			className='fixed inset-0 flex items-end z-[200]'
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
						onClick={e => {
							e.preventDefault()
							onClose()
							onAddAccount()
						}}
						className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/8 text-[#9CA3AF] text-sm hover:bg-white/8'
					>
						<Plus size={15} />
						Добавить аккаунт
					</button>
				)}

				<button
					type='button'
					onClick={e => {
						e.preventDefault()
						setConfirmLogout(true)
					}}
					className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/15'
				>
					<LogOut size={15} />
					Выйти из аккаунта
				</button>
			</div>
		</div>
	)
}
