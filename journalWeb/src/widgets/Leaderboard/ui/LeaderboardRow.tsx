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

export const LeaderboardRow = memo(function LeaderboardRow({
	student,
	isMe,
}: Props) {
	const rankColor =
		RANK_COLORS[student.position] ??
		(isMe ? 'text-[#F29F05]' : 'text-app-muted')

	const shortName = student.full_name
		.split(' ')
		.map((p, i) => (i === 0 ? p : p[0] + '.'))
		.join(' ')
	const initials = student.full_name
		.split(' ')
		.map(p => p[0])
		.join('')
		.slice(0, 2)

	const fallbackClass = isMe
		? 'bg-[#F29F05]/10 text-[#F29F05] border-[#F29F05]/30'
		: 'bg-app-surface-strong text-app-text border-app-border'

	const photoUrl = getCachedImageUrl(student.photo_url)

	return (
		<div
			className={`rounded-[18px] p-3 border flex items-center gap-3 ${
				isMe
					? 'bg-[#F29F05]/10 border-[#F29F05]/30'
					: 'bg-app-surface border-app-border'
			}`}
			style={{
				boxShadow: isMe
					? '0 4px 20px 0 rgba(242,159,5,0.15)'
					: 'var(--shadow-card)',
			}}
		>
			<span className={`w-6 text-center text-base font-bold shrink-0 ${rankColor}`}>
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
							isMe ? 'border-[#F29F05]/50' : 'border-app-border'
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
				<p className={`text-sm font-semibold truncate ${isMe ? 'text-[#F29F05]' : 'text-app-text'}`}>
					{shortName}
					{isMe ? ' (Вы)' : ''}
				</p>
			</div>

			<div
				className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 ${
					isMe
						? 'bg-[#F29F05]/20 border-[#F29F05]/40'
						: 'bg-app-surface-strong border-app-border'
				}`}
			>
				<Coins size={13} className={isMe ? 'text-[#FFD700]' : 'text-[#F29F05]'} />
				<span className={`text-sm font-bold ${isMe ? 'text-[#F29F05]' : 'text-app-text'}`}>
					{student.points.toLocaleString()}
				</span>
			</div>
		</div>
	)
})