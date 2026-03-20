import { resetAllStores } from '@/app/lib/resetAllStores'
import { useProfileDetails } from '@/entities/profile'
import { useAuthStore } from '@/features/auth'
import { AccountSwitcher } from '@/features/changeUser'
import { pageConfig } from '@/shared/config'
import { ProfileAvatar, ProfileInfoCard, ProfileRelativesCard } from '@/widgets'
import { ArrowLeft, CreditCard, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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

	const [showSwitcher, setShowSwitcher] = useState(false)
	const accounts = useAuthStore(s => s.accounts)

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`)
	}

	return (
		<div className='pb-6'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<button
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-white/5 border border-white/8 flex items-center justify-center text-[#9CA3AF] active:scale-95 transition-transform'
				>
					<ArrowLeft size={18} />
				</button>

				<h1 className='text-base font-bold text-[#F2F2F2] flex-1'>
					Детали профиля
				</h1>

				{accounts.length >= 0 && (
					<button
						onClick={() => setShowSwitcher(true)}
						className='flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/8 text-[#9CA3AF] text-xs hover:bg-white/8 transition-colors'
					>
						<Users size={14} />
						Аккаунты
					</button>
				)}
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

						<Link
							to={pageConfig.payment}
							className='flex items-center justify-between bg-white/5 rounded-[20px] p-4 border border-white/10 active:scale-95 transition-transform'
						>
							<div className='flex items-center gap-3'>
								<div className='w-9 h-9 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center'>
									<CreditCard size={18} className='text-[#9CA3AF]' />
								</div>
								<div>
									<p className='text-sm font-medium text-[#F2F2F2]'>Оплата</p>
									<p className='text-xs text-[#9CA3AF]'>
										История и график платежей
									</p>
								</div>
							</div>
							<ArrowLeft size={16} className='text-[#9CA3AF] rotate-180' />
						</Link>
					</>
				)}
			</div>

			{showSwitcher && (
				<AccountSwitcher
					onClose={() => setShowSwitcher(false)}
					onAddAccount={handleAddAccount}
					onReset={resetAllStores}
				/>
			)}
		</div>
	)
}
