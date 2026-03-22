import { pageConfig } from '@/shared/config'
import { ArrowRight, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProfilePaymentCard() {
	return (
		<div
			className='bg-app-surface rounded-[24px] border border-app-border overflow-hidden'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center gap-2 px-5 pt-5 pb-3'>
				<CreditCard size={16} className='text-app-muted' />
				<p className='text-[11px] font-semibold text-app-muted uppercase tracking-wider'>
					Оплата
				</p>
			</div>

			<div className='px-4 pb-4'>
				<Link
					to={pageConfig.payment}
					className='flex items-center gap-3 p-3 rounded-[16px] border border-app-border active:scale-[0.98] transition-transform'
					style={{ background: 'var(--color-surface-strong)' }}
				>
					<div
						className='w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border border-app-border'
						style={{ background: 'var(--color-brand-subtle)' }}
					>
						<CreditCard size={18} className='text-brand' />
					</div>
					<div className='flex-1 min-w-0'>
						<p className='text-sm font-semibold text-app-text'>
							История и график платежей
						</p>
						<p className='text-xs text-app-muted mt-0.5'>
							Просмотр задолженности и реквизитов
						</p>
					</div>
					<ArrowRight size={16} className='text-app-muted shrink-0' />
				</Link>
			</div>
		</div>
	)
}
