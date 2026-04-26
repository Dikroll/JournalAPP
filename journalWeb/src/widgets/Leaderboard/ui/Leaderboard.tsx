import type { LeaderboardScope } from '@/entities/leaderboard'
import { useLeaderboard } from '@/entities/leaderboard'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { LeaderboardRow } from './LeaderboardRow'

export function Leaderboard({ myStudentId }: { myStudentId: number }) {
	const [scope, setScope] = useState<LeaderboardScope>('group')
	const { groupStudents, streamStudents, myRankGroup, myRankStream, status } =
		useLeaderboard()

	const myRank = scope === 'group' ? myRankGroup : myRankStream

	return (
		<div>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-app-text text-base font-semibold flex items-center gap-2'>
					<TrendingUp size={18} className='text-status-comment' />
					Лидеры
				</h3>
				<div className='flex bg-app-surface rounded-xl border border-app-border p-0.5'>
					{(['group', 'stream'] as LeaderboardScope[]).map(s => (
						<button
							key={s}
							onClick={() => setScope(s)}
							className={`px-3 py-1 rounded-[10px] text-xs font-medium transition-all ${
								scope === s
									? 'bg-status-comment text-white'
									: 'text-app-muted hover:text-app-text'
							}`}
						>
							{s === 'group' ? 'Группа' : 'Поток'}
						</button>
					))}
				</div>
			</div>

			{myRank && (
				<div className='flex items-center gap-2'>
					{myRank.week_diff !== 0 && (
						<span
							className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
								myRank.week_diff > 0
									? 'bg-checked-subtle text-status-checked'
									: 'bg-overdue-bg text-status-overdue'
							}`}
						>
							{myRank.week_diff > 0 ? '+' : ''}
							{myRank.week_diff} за неделю
						</span>
					)}
				</div>
			)}

			{status === 'loading' ? (
				<div className='space-y-2'>
					{[1, 2, 3, 4, 5].map(i => (
						<div
							key={i}
							className='bg-app-surface rounded-[18px] h-14 animate-pulse border border-app-border'
						/>
					))}
				</div>
			) : (
				<>
					<div className={`space-y-2 ${scope === 'group' ? '' : 'hidden'}`}>
						{groupStudents.map(s => (
							<LeaderboardRow
								key={s.student_id}
								student={s}
								isMe={s.student_id === myStudentId}
							/>
						))}
					</div>
					<div className={`space-y-2 ${scope === 'stream' ? '' : 'hidden'}`}>
						{streamStudents.map(s => (
							<LeaderboardRow
								key={s.student_id}
								student={s}
								isMe={s.student_id === myStudentId}
							/>
						))}
					</div>
				</>
			)}
		</div>
	)
}
