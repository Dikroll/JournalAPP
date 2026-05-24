import { useLeaderboard } from '@/entities/leaderboard'
import { useUser } from '@/entities/user'
import { Leaderboard, MarketLink, ProfileHeader, ReviewsList } from '@/widgets'

export function ProfilePage() {
	const user = useUser()
	const { myRankGroup } = useLeaderboard()

	if (!user) {
		return (
			<div className='px-4 pt-4 space-y-3'>
				<div className='bg-app-surface rounded-[28px] h-48 animate-pulse border border-app-border' />
				<div className='bg-app-surface rounded-[24px] h-24 animate-pulse border border-app-border' />
			</div>
		)
	}

	return (
		<div className='pb-24'>
			<ProfileHeader user={user} rank={myRankGroup?.position} />

			<div className='px-4 space-y-5'>
				<Leaderboard myStudentId={user.student_id} />
				<MarketLink />
				<ReviewsList />
			</div>
		</div>
	)
}
