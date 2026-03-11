import type { ProfileDetails } from '@/entities/profile'

interface Props {
	details: ProfileDetails
}

export function ProfileAvatar({ details }: Props) {
	const initials = details.full_name
		.split(' ')
		.map(n => n[0])
		.join('')
		.slice(0, 2)

	return (
		<div
			className='bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/8 p-5 flex items-center gap-4'
			style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)' }}
		>
			{details.photo_url ? (
				<img
					src={details.photo_url}
					alt={details.full_name}
					width={64}
					height={64}
					loading='lazy'
					decoding='async'
					className='w-16 h-16 rounded-full object-cover border-2 border-white/10 shrink-0'
				/>
			) : (
				<div
					className='w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white/10 shrink-0'
					style={{ background: 'linear-gradient(135deg,#F20519,#F29F05)' }}
				>
					{initials}
				</div>
			)}
			<div className='flex-1 min-w-0'>
				<p className='text-base font-bold text-[#F2F2F2] leading-snug'>
					{details.full_name}
				</p>
				{details.fill_percentage != null && (
					<div className='mt-2.5'>
						<div className='flex items-center justify-between mb-1'>
							<span className='text-[11px] text-[#6B7280]'>
								Заполненность профиля
							</span>
							<span className='text-[11px] font-semibold text-[#9CA3AF]'>
								{details.fill_percentage}%
							</span>
						</div>
						<div className='h-1.5 rounded-full bg-white/10 overflow-hidden'>
							<div
								className='h-full rounded-full'
								style={{
									width: `${details.fill_percentage}%`,
									background: 'linear-gradient(90deg,#F20519,#F29F05)',
								}}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
