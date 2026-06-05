
import type { UserInfo } from '@/entities/user'
import { pageConfig } from '@/shared/config'
import { Coins, Gem, ArrowRight, Wallet, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
	user: UserInfo
}

export function DesktopMarketWidget({ user }: Props) {
	const topmoney = user.points.diamonds.balance
	const topgems = user.points.coins.balance

	return (
		<div
			className="rounded-[24px] border border-app-border bg-app-surface p-5"
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className="flex items-center gap-2 mb-5">
				<Wallet size={20} className="text-app-text" />
				<h3 className="text-app-text text-lg font-bold leading-snug">
					Баланс
				</h3>
			</div>

			<div className="grid grid-cols-2 gap-3 mb-5">
				<div className="bg-app-surface-hover rounded-2xl p-4 border border-app-border flex items-center gap-3">
					<div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface)' }}>
						<Coins size={20} className="text-[#FFD700]" />
					</div>
					<div className="min-w-0">
						<p className="text-xs text-app-muted leading-tight mb-1">Топмани</p>
						<p className="text-xl font-bold text-app-text leading-tight truncate">{topmoney.toLocaleString()}</p>
					</div>
				</div>
				<div className="bg-app-surface-hover rounded-2xl p-4 border border-app-border flex items-center gap-3">
					<div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface)' }}>
						<Gem size={20} className="text-[#00D9FF]" />
					</div>
					<div className="min-w-0">
						<p className="text-xs text-app-muted leading-tight mb-1">Топгемы</p>
						<p className="text-xl font-bold text-app-text leading-tight truncate">{topgems.toLocaleString()}</p>
					</div>
				</div>
			</div>

			<Link
				to={pageConfig.market}
				className="flex items-center justify-center gap-2 w-full py-4 rounded-[18px] text-white font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
				style={{
					background: 'linear-gradient(90deg, #ff3b30 0%, #ff9500 100%)',
				}}
			>
				Перейти в магазин
				<ShoppingBag size={18} className="text-white/80 ml-2" />
				<ArrowRight size={16} className="text-white/60" />
			</Link>
		</div>
	)
}
