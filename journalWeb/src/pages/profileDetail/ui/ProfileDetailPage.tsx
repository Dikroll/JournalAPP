import { resetAllStores } from '@/app/lib/resetAllStores'
import { useProfileDetails } from '@/entities/profile'
import { useAuthStore } from '@/features/auth'
import { AccountSwitcher } from '@/features/changeUser'
import { pageConfig } from '@/shared/config'
import {
	ProfileAvatar,
	ProfileInfoCard,
	ProfilePaymentCard,
	ProfileRelativesCard,
} from '@/widgets'
import { ArrowLeft, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Skeleton() {
	return (
		<div className='space-y-3'>
			{[88, 180, 200].map((h, i) => (
				<div
					key={i}
					className='bg-app-surface-strong rounded-[24px] animate-pulse'
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
					type='button'
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<ArrowLeft size={18} />
				</button>

				<h1 className='text-base font-bold text-app-text flex-1'>
					Детали профиля
				</h1>

				{accounts.length >= 0 && (
					<button
						type='button'
						onClick={() => setShowSwitcher(true)}
						className='flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border text-app-muted text-xs hover:bg-app-surface-hover transition-colors'
						style={{ boxShadow: 'var(--shadow-card)' }}
					>
						<Users size={14} />
						Аккаунты
					</button>
				)}
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <Skeleton />}

				{status === 'error' && (
					<p className='text-center text-status-overdue text-sm py-12'>
						Не удалось загрузить данные
					</p>
				)}

				{details && (
					<>
						<ProfileAvatar details={details} />
						<ProfileInfoCard details={details} />
						<ProfileRelativesCard relatives={details.relatives} />
						<ProfilePaymentCard />
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
