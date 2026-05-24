import { pageConfig } from '@/shared/config'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
export function MarketLink() {
	return (
		<Link
			to={pageConfig.market}
			className='bg-app-surface rounded-[20px] p-4 border border-app-border flex items-center justify-between active:scale-[0.99] transition-transform'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center gap-3'>
				<div className='w-11 h-11 rounded-[16px] bg-brand/10 flex items-center justify-center text-brand'>
					<ShoppingBag size={21} />
				</div>
				<div>
					<p className='text-sm font-semibold text-app-text'>Маркет</p>
					<p className='text-xs text-app-muted mt-0.5'>
						Товары за топмани и топгемы
					</p>
				</div>
			</div>
			<span className='text-sm text-brand font-medium'>Открыть</span>
		</Link>
	)
}
