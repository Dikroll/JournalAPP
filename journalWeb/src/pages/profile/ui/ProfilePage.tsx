import { resetAllStores } from '@/app/lib/resetAllStores'
import { useLeaderboard } from '@/entities/leaderboard'
import { useUser } from '@/entities/user'
import { LogoutButton } from '@/features/auth'
import { pageConfig } from '@/shared/config'
import { Leaderboard, ProfileHeader, ReviewsList } from '@/widgets'
import { Link } from 'react-router-dom'

export function ProfilePage() {
	const user = useUser()
	const { myRankGroup } = useLeaderboard()

	if (!user) {
		return (
			<div className='px-4 pt-4 space-y-3'>
				<div className='bg-white/5 rounded-[28px] h-48 animate-pulse border border-white/10' />
				<div className='bg-white/5 rounded-[24px] h-24 animate-pulse border border-white/10' />
			</div>
		)
	}

	return (
		<div className='pb-24'>
			<ProfileHeader user={user} rank={myRankGroup?.position} />

			<div className='px-4 space-y-5'>
				{user.is_debtor && (
					<div
						className='bg-[#EF4444]/10 rounded-[20px] p-4 border border-[#EF4444]/20 flex items-center justify-between'
						style={{ boxShadow: '0 4px 16px 0 rgba(239,68,68,0.1)' }}
					>
						<div>
							<p className='text-xs text-[#9CA3AF] mb-0.5'>Статус оплаты</p>
							<p className='text-sm font-semibold text-[#EF4444]'>
								Есть задолженность
							</p>
						</div>
						<Link
							to={pageConfig.payment}
							className='px-4 py-2 rounded-[14px] bg-white/10 border border-white/10 text-sm text-[#F2F2F2] font-medium'
						>
							История
						</Link>
					</div>
				)}

				<Leaderboard myStudentId={user.student_id} />
				<ReviewsList />

				<LogoutButton onBeforeLogout={resetAllStores} />
			</div>
		</div>
	)
}
