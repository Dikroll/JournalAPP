import { paymentApi } from '@/entities/payment'
import { usePayment } from '@/entities/payment/hooks/usePayment'
import { usePaymentIndex } from '@/entities/payment/hooks/usePaymentIndex'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import {
	PaymentHistoryCard,
	PaymentRequisitesCard,
	PaymentScheduleCard,
} from '@/widgets'
import { Download } from 'lucide-react'
import { useState } from 'react'

export function PaymentPage() {
	const { summary, status } = usePayment()
	const { index } = usePaymentIndex()
	const [isDownloading, setIsDownloading] = useState(false)
	const isDesktop = useIsDesktop()

	useSwipeBack()

	const handleDownload = async () => {
		try {
			setIsDownloading(true)
			await paymentApi.downloadRequisites()
		} catch (error) {
			console.error('Failed to download requisites', error)
		} finally {
			setIsDownloading(false)
		}
	}

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
		: []

	return (
		<div className='pb-6 text-app-text'>
			<div className='px-4 pt-4 pb-4'>
				<PageHeader 
					title='Оплата' 
					showBack={!isDesktop}
					actions={
						<button
							onClick={handleDownload}
							disabled={isDownloading}
							className={`w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted transition-transform ${
								isDownloading ? 'opacity-50' : 'active:scale-95'
							}`}
						>
							<Download size={18} />
						</button>
					}
				/>
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <SkeletonList count={3} height={150} />}

				{status === 'error' && !summary && (
					<ErrorView message='Не удалось загрузить данные' />
				)}

				{summary && (
					<>
						<PaymentRequisitesCard requisites={requisites} />
						<PaymentScheduleCard schedule={summary.schedule} />
						<PaymentHistoryCard history={summary.history} />
					</>
				)}
			</div>
		</div>
	)
}
