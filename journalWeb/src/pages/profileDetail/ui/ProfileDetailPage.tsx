import { useProfileDetails } from '@/entities/profile'
import { LogoutButton } from '@/features/auth'
import { ProfileAvatar, ProfileInfoCard, ProfileRelativesCard } from '@/widgets'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Skeleton() {
	return (
		<div className='space-y-3'>
			{[88, 180, 200].map((h, i) => (
				<div
					key={i}
					className='bg-white/5 rounded-[24px] animate-pulse'
					style={{ height: h }}
				/>
			))}
		</div>
	)
}

export function ProfileDetailsPage() {
	const navigate = useNavigate()
	const { details, status } = useProfileDetails()

	return (
		<div className='pb-6'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<button
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-white/5 border border-white/8 flex items-center justify-center text-[#9CA3AF] active:scale-95 transition-transform'
				>
					<ArrowLeft size={18} />
				</button>
				<h1 className='text-base font-bold text-[#F2F2F2]'>Детали профиля</h1>
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <Skeleton />}
				{status === 'error' && (
					<p className='text-center text-[#EF4444] text-sm py-12'>
						Не удалось загрузить данные
					</p>
				)}
				{details && (
					<>
						<ProfileAvatar details={details} />
						<ProfileInfoCard details={details} />
						<ProfileRelativesCard relatives={details.relatives} />
						<LogoutButton />
					</>
				)}
			</div>
		</div>
	)
}
