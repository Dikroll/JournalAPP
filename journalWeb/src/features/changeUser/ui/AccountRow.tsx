import type { SavedAccount } from '@/features/auth/model/store'
import { RefreshCw, Trash2, UserRound } from 'lucide-react'

interface Props {
	account: SavedAccount
	isActive: boolean
	isSwitching: boolean
	onSwitch: () => void
	onRemove: () => void
}

export function AccountRow({
	account,
	isActive,
	isSwitching,
	onSwitch,
	onRemove,
}: Props) {
	return (
		<div
			className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
				isActive
					? 'bg-glass-active border border-glass-strong'
					: 'bg-glass border border-glass-border hover:bg-glass-hover cursor-pointer active:bg-glass-active'
			}`}
			onClick={!isActive && !isSwitching ? onSwitch : undefined}
		>
			<div className='w-10 h-10 rounded-full overflow-hidden bg-glass-active border border-glass-border flex-shrink-0 flex items-center justify-center'>
				{account.avatarUrl ? (
					<img
						src={account.avatarUrl}
						alt={account.fullName}
						className='w-full h-full object-cover'
					/>
				) : (
					<UserRound size={18} className='text-app-muted' />
				)}
			</div>

			<div className='flex-1 min-w-0'>
				<p className='text-sm font-medium text-app-text truncate'>
					{account.fullName}
				</p>
				<p className='text-xs text-app-muted truncate'>{account.groupName}</p>
			</div>

			{isSwitching ? (
				<RefreshCw
					size={14}
					className='text-app-muted animate-spin flex-shrink-0'
				/>
			) : isActive ? (
				<span className='text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0'>
					Активен
				</span>
			) : (
				<button
					type='button'
					onClick={e => {
						e.preventDefault()
						e.stopPropagation()
						onRemove()
					}}
					className='p-1.5 rounded-full hover:bg-glass-active text-app-muted hover:text-danger flex-shrink-0'
				>
					<Trash2 size={13} />
				</button>
			)}
		</div>
	)
}
