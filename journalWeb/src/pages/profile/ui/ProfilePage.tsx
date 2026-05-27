import { resetAllAppState } from '@/shared/lib/resetAllAppState'
import { useLeaderboard } from '@/entities/leaderboard'
import { useProfileDetails } from '@/entities/profile'
import { useUser } from '@/entities/user'
import { usePayment } from '@/entities/payment/hooks/usePayment'
import { usePaymentIndex } from '@/entities/payment/hooks/usePaymentIndex'
import { pageConfig } from '@/shared/config'
import { SkeletonList } from '@/shared/ui'
import { isWebPlatform } from '@/shared/lib/platform'
import {
	AccountSwitcher,
	ClearCacheSheet,
	Leaderboard,
	MarketLink,
	PaymentHistoryCard,
	PaymentRequisitesCard,
	PaymentScheduleCard,
	ProfileHeader,
	ProfileInfoCard,
	ProfileRelativesCard,
	ReviewsList,
	SettingsSection,
} from "@/widgets";

export function ProfilePage() {
	const user = useUser();
	const { myRankGroup } = useLeaderboard();
	const { details, status: detailsStatus } = useProfileDetails();

	const { summary, status: paymentStatus } = usePayment();
	const { index } = usePaymentIndex();

	const [showSwitcher, setShowSwitcher] = useState(false);
	const [showClearCache, setShowClearCache] = useState(false);
	const navigate = useNavigate();

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`);
	};

	const requisites = index
		? [
				{ label: 'Получатель', value: index.payment.organization_name },
				{ label: 'ИНН', value: index.payment.okpo },
				{ label: 'БИК', value: index.payment.mfo },
				{ label: 'Расчётный счёт', value: index.payment.settlement_account },
				{
					label: 'Назначение платежа',
					value: `${index.payment.purpose_of_payment} 1C код: ${index.one_c_code}`,
				},
			]
		: [];

	if (!user) {
		return (
			<div className="px-4 pt-4 space-y-3 max-w-4xl mx-auto w-full">
				<div className="bg-app-surface rounded-[28px] h-48 animate-pulse border border-app-border" />
				<div className="bg-app-surface rounded-[24px] h-24 animate-pulse border border-app-border" />
			</div>
		);
	}

	const isDesktop = useIsDesktop()
	const isWeb = isWebPlatform

	if (!isDesktop) {
		return (
			<div className="pb-24 w-full">
				<ProfileHeader user={user} rank={myRankGroup?.position} />

				<div className="px-4 space-y-5 mt-4">
					<Leaderboard myStudentId={user.student_id} />
					<MarketLink />
					<ReviewsList />
				</div>
			</div>
		);
	}

	return (
		<div className="pb-24 w-full">
			<div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-5 items-start">
				{/* Левая колонка: Шапка, Детали, Настройки */}
				<div className="space-y-4 lg:space-y-5">
					<ProfileHeader user={user} rank={myRankGroup?.position} />

					<div className="px-4 space-y-5">
						{detailsStatus === "loading" && (
							<SkeletonList count={3} height={120} />
						)}

						{details && (
							<div
								className="bg-app-surface rounded-[24px] border border-app-border p-4"
								style={{ boxShadow: "var(--shadow-card)" }}
							>
								<p className="text-lg font-bold text-app-text mb-2 px-1">
									Детали профиля
								</p>
								<ProfileInfoCard details={details} flat />

								{details.relatives.length > 0 && (
									<>
										<div className="h-px bg-app-border my-2" />
										<ProfileRelativesCard relatives={details.relatives} flat />
									</>
								)}
							</div>
						)}

						<SettingsSection
							onAccounts={() => setShowSwitcher(true)}
							onClearCache={() => setShowClearCache(true)}
						/>

						<MarketLink />
						{!isWeb && <ReviewsList />}
					</div>
				</div>

				{/* Правая колонка: Оплата */}
				<div className="px-4 space-y-5 lg:pt-4 pt-5">
					{user.is_debtor && (
						<div
							className="bg-[#EF4444]/10 rounded-[20px] p-4 border border-[#EF4444]/20 flex items-center justify-between"
							style={{ boxShadow: "0 4px 16px 0 rgba(239,68,68,0.1)" }}
						>
							<div>
								<p className="text-xs text-[#9CA3AF] mb-0.5">Статус оплаты</p>
								<p className="text-sm font-semibold text-[#EF4444]">
									Есть задолженность
								</p>
							</div>
						</div>
					)}

					{paymentStatus === "loading" && (
						<SkeletonList count={3} height={150} />
					)}

					{summary && (
						<div
							className="bg-app-surface rounded-[24px] border border-app-border p-4"
							style={{ boxShadow: "var(--shadow-card)" }}
						>
							<p className="text-lg font-bold text-app-text mb-4 px-1">
								Оплата
							</p>

							<PaymentScheduleCard schedule={summary.schedule} flat />

							{requisites.length > 0 && (
								<>
									<div className="h-px bg-app-border my-4" />
									<PaymentRequisitesCard requisites={requisites} flat />
								</>
							)}

							{summary.history.length > 0 && (
								<>
									<div className="h-px bg-app-border my-4" />
									<PaymentHistoryCard history={summary.history} flat />
								</>
							)}
						</div>
					)}
				</div>
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
	);
}
