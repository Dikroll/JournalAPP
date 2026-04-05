import type { UserInfo } from '@/entities/user'
import { pageConfig } from '@/shared/config'
import { usePhotoViewer } from '@/shared/hooks'
import { getCachedImageUrl } from '@/shared/lib'
import { Coins, Diamond, TrendingUp } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'

interface Props {
	user: UserInfo
	rank?: number
}

export const ProfileHeader = memo(
	function ProfileHeader({ user, rank }: Props) {
		const photoViewer = usePhotoViewer()
		const photoUrl = getCachedImageUrl(user.photo_url)

		const initials = user.full_name
			.split(' ')
			.map(n => n[0])
			.join('')
			.slice(0, 2)

		const coins = user.points.coins.earned
		const diamonds = user.points.diamonds.earned

		return (
			<>
				<div className='px-4 pt-4 pb-2'>
					<div
						className='rounded-[28px] p-6 relative overflow-hidden'
						style={{
							background: 'linear-gradient(135deg, #F20519 0%, #F29F05 100%)',
							boxShadow: '0 8px 32px 0 rgba(242,5,25,0.3)',
						}}
					>
						{/* декоративные градиенты */}
						<div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none' />
						<div className='absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl pointer-events-none' />

						{/* верхний блок */}
						<div className='relative flex items-center gap-4 mb-5'>
							<div className='shrink-0'>
								{photoUrl ? (
									<button
										type='button'
										onClick={() => photoViewer.open(photoUrl, user.full_name)}
										className='w-16 h-16 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity'
									>
										<img
											src={photoUrl}
											alt={user.full_name}
											width={64}
											height={64}
											loading='eager'
											decoding='async'
											className='w-full h-full object-cover border-2 border-white/30'
										/>
									</button>
								) : (
									<div className='w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xl font-bold'>
										{initials}
									</div>
								)}
							</div>

							<div className='flex-1 min-w-0'>
								<h2 className='text-white text-lg font-bold leading-snug'>
									{user.full_name}
								</h2>
								<p className='text-white/70 text-sm mt-0.5'>
									{user.group.name}
								</p>
							</div>

							<Link
								to={pageConfig.profileDetails}
								className='shrink-0 px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs font-medium'
							>
								Подробнее
							</Link>
						</div>

						{/* статистика */}
						<div className='relative grid grid-cols-3 gap-2'>
							{[
								{
									icon: <Coins size={15} className='text-[#FFD700]' />,
									label: 'Топмани',
									value: coins.toLocaleString(), // фикс: теперь coins = money
								},
								{
									icon: <Diamond size={15} className='text-[#00D9FF]' />,
									label: 'Топгемы',
									value: diamonds.toLocaleString(), // фикс: diamonds = gems
								},
								{
									icon: (
										<TrendingUp size={15} className='text-status-checked' />
									),
									label: 'Рейтинг',
									value: rank ? `#${rank}` : '—',
								},
							].map(({ icon, label, value }) => (
								<div
									key={label}
									className='bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30'
								>
									<div className='flex items-center gap-1.5 mb-1'>
										{icon}
										<span className='text-[11px] text-white/70'>{label}</span>
									</div>
									<div className='text-base font-bold text-white'>{value}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{photoUrl && photoViewer.renderModal(photoUrl, user.full_name)}
			</>
		)
	},
	(prev, next) =>
		prev.user.photo_url === next.user.photo_url &&
		prev.user.full_name === next.user.full_name &&
		prev.user.points.coins.earned === next.user.points.coins.earned &&
		prev.user.points.diamonds.earned === next.user.points.diamonds.earned &&
		prev.rank === next.rank,
)
