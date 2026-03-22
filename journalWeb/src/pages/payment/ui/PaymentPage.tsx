import { usePayment } from '@/entities/payment/hooks/usePayment'
import { usePaymentIndex } from '@/entities/payment/hooks/usePaymentIndex'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import {
	PaymentHistoryCard,
	PaymentRequisitesCard,
	PaymentScheduleCard,
} from '@/widgets'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PaymentPage() {
	const navigate = useNavigate()
	const { summary, status } = usePayment()
	const { index } = usePaymentIndex()

	useSwipeBack()

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

	return (
		<div className='pb-6 text-app-text'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<button
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
				>
					<ArrowLeft size={18} />
				</button>
				<PageHeader title='Оплата' />
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <SkeletonList count={3} height={150} />}

				{status === 'error' && (
					<ErrorView message='Не удалось загрузить данные' />
				)}

				{summary && (
					<>
						<PaymentScheduleCard schedule={summary.schedule} />
						<PaymentRequisitesCard requisites={requisites} />
						<PaymentHistoryCard history={summary.history} />
					</>
				)}
			</div>
		</div>
	)
}
