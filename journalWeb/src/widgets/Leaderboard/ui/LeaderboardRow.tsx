import type { LeaderboardStudent } from '@/entities/leaderboard'
import { getCachedImageUrl } from '@/shared/lib'
import { AvatarPlaceholder, PhotoViewerModal } from '@/shared/ui'
import { getShortName } from '@/shared/utils/nameUtils'
import { Coins, Crown, Medal } from 'lucide-react'
import { memo, useState } from 'react'

interface Props {
	student: LeaderboardStudent
	isMe: boolean
}

function RankBadge({ rank }: { rank: number }) {
	if (rank === 1)
		return (
			<div className='absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#FFD700] to-[#F59E0B] rounded-full flex items-center justify-center shadow-sm'>
				<Crown size={10} className='text-white' />
			</div>
		)
	if (rank <= 3)
		return (
			<div
				className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
					rank === 2
						? 'bg-gradient-to-br from-[#C0C0C0] to-[#9CA3AF]'
						: 'bg-gradient-to-br from-[#CD7F32] to-[#92400E]'
				}`}
			>
				<Medal size={10} className='text-white' />
			</div>
		)
	return null
}

const RANK_COLORS: Record<number, string> = {
	1: '#D97706',
	2: '#9CA3AF',
	3: '#B45309',
}

const AMBER = {
	bg: 'rgba(245, 158, 11, 0.10)',
	border: 'rgba(245, 158, 11, 0.28)',
	text: '#D97706',
	badgeBg: 'rgba(245, 158, 11, 0.15)',
	badgeBorder: 'rgba(245, 158, 11, 0.30)',
	shadow: '0 2px 14px 0 rgba(245, 158, 11, 0.14)',
}

export const LeaderboardRow = memo(function LeaderboardRow({
	student,
	isMe,
}: Props) {
	const [viewerOpen, setViewerOpen] = useState(false)
	const rankColor = RANK_COLORS[student.position]
	const shortName = getShortName(student.full_name)
	const photoUrl = getCachedImageUrl(student.photo_url)

	return (
		<>
			<div
				className='rounded-[18px] p-3 flex items-center gap-3'
				style={
					isMe
						? {
								background: AMBER.bg,
								border: `1px solid ${AMBER.border}`,
								boxShadow: AMBER.shadow,
						  }
						: {
								background: 'var(--color-surface)',
								border: '1px solid var(--color-border)',
								boxShadow: 'var(--shadow-card)',
						  }
				}
			>
				<span
					className='w-6 text-center text-base font-bold shrink-0'
					style={{
						color: isMe ? AMBER.text : rankColor ?? 'var(--color-text-muted)',
					}}
				>
					{student.position}
				</span>

				<div className='relative shrink-0'>
					{photoUrl ? (
						<button
							type='button'
							onClick={() => setViewerOpen(true)}
							className='w-10 h-10 p-0 rounded-full overflow-hidden focus:outline-none'
						>
							<img
								src={photoUrl}
								alt={student.full_name}
								width={40}
								height={40}
								loading={student.position <= 3 ? 'eager' : 'lazy'}
								fetchPriority={student.position === 1 ? 'high' : 'auto'}
								className='w-10 h-10 rounded-full object-cover'
								style={{
									border: isMe
										? `2px solid ${AMBER.border}`
										: '2px solid var(--color-border)',
								}}
							/>
							<RankBadge rank={student.position} />
						</button>
					) : (
						<AvatarPlaceholder
							fullName={student.full_name}
							size={40}
							style={
								isMe
									? { border: `2px solid ${AMBER.border}` }
									: { border: '2px solid var(--color-border)' }
							}
						/>
					)}
				</div>

				<div className='flex-1 min-w-0'>
					<p
						className='text-sm font-semibold truncate'
						style={{ color: isMe ? AMBER.text : 'var(--color-text)' }}
					>
						{shortName}
						{isMe && (
							<span className='ml-1 text-xs font-normal opacity-60'>(Вы)</span>
						)}
					</p>
				</div>

				<div
					className='flex items-center gap-1 px-2.5 py-1.5 rounded-xl shrink-0'
					style={
						isMe
							? {
									background: AMBER.badgeBg,
									border: `1px solid ${AMBER.badgeBorder}`,
							  }
							: {
									background: 'var(--color-surface-strong)',
									border: '1px solid var(--color-border)',
							  }
					}
				>
					<Coins
						size={13}
						style={{ color: isMe ? '#FFD700' : 'var(--color-comment)' }}
					/>
					<span
						className='text-sm font-bold'
						style={{ color: isMe ? AMBER.text : 'var(--color-text)' }}
					>
						{student.points.toLocaleString()}
					</span>
				</div>
			</div>

			{viewerOpen && photoUrl && (
				<PhotoViewerModal
					src={photoUrl}
					alt={student.full_name}
					onClose={() => setViewerOpen(false)}
				/>
			)}
		</>
	)
})
