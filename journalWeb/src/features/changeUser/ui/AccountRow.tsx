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
						e.preventDefault()
						e.stopPropagation()
						onRemove()
					}}
					className='p-1.5 rounded-full hover:bg-white/10 text-[#6B7280] hover:text-[#EF4444] flex-shrink-0'
				>
					<Trash2 size={13} />
				</button>
			)}
		</div>
	)
}
