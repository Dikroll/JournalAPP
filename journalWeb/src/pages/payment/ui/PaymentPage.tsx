import { usePayment } from '@/entities/payment/hooks/usePayment'
import { usePaymentIndex } from '@/entities/payment/hooks/usePaymentIndex'
import { formatDateShort } from '@/shared/utils'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function formatAmount(amount: number) {
	return amount.toLocaleString('ru-RU') + ' ₽'
}

export function PaymentPage() {
	const navigate = useNavigate()
	const { summary, status } = usePayment()
	const { index } = usePaymentIndex()

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
				<h1 className='text-base font-bold text-app-text'>Оплата</h1>
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && (
					<div className='space-y-3'>
						{[120, 150, 250, 200].map((h, i) => (
							<div
								key={i}
								className='bg-app-surface rounded-[24px] animate-pulse'
								style={{ height: h }}
							/>
						))}
					</div>
				)}

				{status === 'error' && (
					<p className='text-center text-status-overdue text-sm py-12'>
						Не удалось загрузить данные
					</p>
				)}

				{summary && (
					<>
						{/* График платежей */}
						<div
							className='bg-app-surface rounded-[24px] border border-app-border p-4'
							style={{ boxShadow: 'var(--shadow-card)' }}
						>
							<p className='text-sm font-semibold text-app-text mb-3'>
								График платежей
							</p>
							<div className='flex flex-col gap-2'>
								{summary.schedule.map(item => (
									<div
										key={item.id}
										className='flex items-center gap-3 bg-app-surface-strong rounded-[16px] p-3'
									>
										{item.is_paid ? (
											<CheckCircle
												size={18}
												className='text-status-checked flex-shrink-0'
											/>
										) : (
											<Circle
												size={18}
												className='text-app-muted flex-shrink-0'
											/>
										)}
										<div className='flex-1 min-w-0'>
											<p
												className={`text-sm font-medium ${
													item.is_paid
														? 'text-app-muted line-through'
														: 'text-app-text'
												}`}
											>
												{item.description}
											</p>
											<p className='text-xs text-app-muted'>
												до {formatDateShort(item.due_date)}
											</p>
										</div>
										<p
											className={`text-sm font-bold flex-shrink-0 ${
												item.is_paid ? 'text-status-checked' : 'text-app-text'
											}`}
										>
											{formatAmount(item.amount)}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Реквизиты */}
						{requisites.length > 0 && (
							<div
								className='bg-app-surface rounded-[24px] border border-app-border p-4'
								style={{ boxShadow: 'var(--shadow-card)' }}
							>
								<p className='text-sm font-semibold text-app-text mb-3'>
									Реквизиты для оплаты
								</p>
								<div className='flex flex-col gap-3'>
									{requisites.map(r => (
										<div key={r.label}>
											<p className='text-[10px] text-app-muted mb-0.5'>
												{r.label}
											</p>
											<p className='text-xs text-app-text'>{r.value}</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* История платежей */}
						{summary.history.length > 0 && (
							<div
								className='bg-app-surface rounded-[24px] border border-app-border p-4'
								style={{ boxShadow: 'var(--shadow-card)' }}
							>
								<p className='text-sm font-semibold text-app-text mb-3'>
									История платежей
								</p>
								<div className='flex flex-col gap-2'>
									{summary.history.map((item, i) => (
										<div
											key={i}
											className='flex items-center justify-between bg-app-surface-strong rounded-[16px] p-3'
										>
											<div className='flex-1 min-w-0 mr-3'>
												<p className='text-sm font-medium text-app-text truncate'>
													{item.description || 'Платёж'}
												</p>
												<p className='text-xs text-app-muted'>
													{formatDateShort(item.date)}
												</p>
											</div>
											<p className='text-sm font-bold text-status-checked flex-shrink-0'>
												+{formatAmount(item.amount)}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
