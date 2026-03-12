import type { LeaderboardStudent } from '@/entities/leaderboard'
import { getCachedImageUrl } from '@/shared/lib'
import { Coins, Crown, Medal } from 'lucide-react'
import { memo } from 'react'

interface Props {
	student: LeaderboardStudent
	isMe: boolean
}

function RankBadge({ rank }: { rank: number }) {
	if (rank === 1)
		return (
			<div className='absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow'>
				<Crown size={10} className='text-white' />
			</div>
		)
	if (rank <= 3)
		return (
			<div
				className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow ${
					rank === 2
						? 'bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8]'
						: 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513]'
				}`}
			>
				<Medal size={10} className='text-white' />
			</div>
		)
	return null
}

const RANK_COLORS: Record<number, string> = {
	1: 'text-[#FFD700]',
	2: 'text-[#C0C0C0]',
	3: 'text-[#CD7F32]',
}

const AVATAR_CLASS: Record<number, string> = {
	1: 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30',
	2: 'bg-[#C0C0C0]/10 text-[#C0C0C0] border-[#C0C0C0]/30',
	3: 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/30',
}

export const LeaderboardRow = memo(function LeaderboardRow({
	student,
	isMe,
}: Props) {
	const rankColor =
		RANK_COLORS[student.position] ??
		(isMe ? 'text-[#F29F05]' : 'text-[#9CA3AF]')
	const shortName = student.full_name
		.split(' ')
		.map((p, i) => (i === 0 ? p : p[0] + '.'))
		.join(' ')
	const initials = student.full_name
		.split(' ')
		.map(p => p[0])
		.join('')
		.slice(0, 2)
	const fallbackClass =
		AVATAR_CLASS[student.position] ??
		(isMe
			? 'bg-[#F29F05]/10 text-[#F2F2F2] border-[#F29F05]/30'
			: 'bg-white/10 text-[#F2F2F2] border-white/10')

	// Фиксируем localhost:8000 → реальный хост
	const photoUrl = getCachedImageUrl(student.photo_url)

	return (
		<div
			className={`rounded-[18px] p-3 border flex items-center gap-3 ${
				isMe
					? 'bg-[#F29F05]/10 border-[#F29F05]/30'
					: 'bg-white/5 border-white/10'
			}`}
			style={{
				boxShadow: isMe
					? '0 4px 20px 0 rgba(242,159,5,0.15)'
					: '0 2px 12px 0 rgba(0,0,0,0.2)',
			}}
		>
			<span
				className={`w-6 text-center text-base font-bold shrink-0 ${rankColor}`}
			>
				{student.position}
			</span>

			<div className='relative shrink-0'>
				{photoUrl ? (
					<img
						src={photoUrl}
						alt={student.full_name}
						width={40}
						height={40}
						loading={student.position <= 3 ? 'eager' : 'lazy'}
						fetchPriority={student.position === 1 ? 'high' : 'auto'}
						className={`w-10 h-10 rounded-full object-cover border-2 ${
							isMe ? 'border-[#F29F05]/50' : 'border-white/10'
						}`}
					/>
				) : (
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${fallbackClass}`}
					>
						{initials}
					</div>
				)}
				<RankBadge rank={student.position} />
			</div>

			<div className='flex-1 min-w-0'>
				<p
					className={`text-sm font-semibold truncate ${isMe ? 'text-[#F29F05]' : 'text-[#F2F2F2]'}`}
				>
					{shortName}
					{isMe ? ' (Вы)' : ''}
				</p>
			</div>

			<div
				className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 ${
					isMe
						? 'bg-[#F29F05]/20 border-[#F29F05]/40'
						: 'bg-white/5 border-white/10'
				}`}
			>
				<Coins
					size={13}
					className={isMe ? 'text-[#FFD700]' : 'text-[#F29F05]'}
				/>
				<span
					className={`text-sm font-bold ${isMe ? 'text-[#F29F05]' : 'text-[#F2F2F2]'}`}
				>
					{student.points.toLocaleString()}
				</span>
			</div>
		</div>
	)
})
