import { resetAllAppState } from '@/app/lib'
import { useLeaderboard } from '@/entities/leaderboard'
import { useProfileDetails } from '@/entities/profile'
import { useUser } from '@/entities/user'
import { Leaderboard, MarketLink, ProfileHeader, ReviewsList } from '@/widgets'

export function ProfilePage() {
	const user = useUser()
	const { myRankGroup } = useLeaderboard()
	const { details, status: detailsStatus } = useProfileDetails()
	
	const { summary, status: paymentStatus } = usePayment()
	const { index } = usePaymentIndex()

	const [showSwitcher, setShowSwitcher] = useState(false)
	const [showClearCache, setShowClearCache] = useState(false)
	const navigate = useNavigate()

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`)
	}

	const requisites = index
		? [
				{ label: 'Получатель', value: index.payment.organization_name },
				{ label: 'Плательщик', value: index.payment.payer_full_name },
				{ label: 'Банк', value: index.payment.bank_name },
				{ label: 'Расчётный счёт', value: index.payment.settlement_account },
				{
					label: 'Назначение платежа',
					value: index.payment.purpose_of_payment,
				},
		  ]
		: []

	if (!user) {
		return (
			<div className='px-4 pt-4 space-y-3 max-w-4xl mx-auto w-full'>
				<div className='bg-app-surface rounded-[28px] h-48 animate-pulse border border-app-border' />
				<div className='bg-app-surface rounded-[24px] h-24 animate-pulse border border-app-border' />
			</div>
		)
	}

	return (
		<div className='pb-24 w-full'>
			<div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-5 items-start'>
				
				{/* Левая колонка: Шапка, Детали, Настройки */}
				<div className='space-y-4 lg:space-y-5'>
					<ProfileHeader user={user} rank={myRankGroup?.position} />

			<div className='px-4 space-y-5'>
				<Leaderboard myStudentId={user.student_id} />
				<MarketLink />
				<ReviewsList />
			</div>

			{showSwitcher && (
				<AccountSwitcher
					onClose={() => setShowSwitcher(false)}
					onAddAccount={handleAddAccount}
					onReset={() =>
						resetAllAppState({
							resetAuth: false,
							resetTheme: false,
							resetOnboarding: false,
						})
					}
				/>
			)}

			{showClearCache && (
				<ClearCacheSheet onClose={() => setShowClearCache(false)} />
			)}
		</div>
	)
}
