import { useMarket } from '@/entities/market'
import type { UserInfo } from '@/entities/user'
import { pageConfig } from '@/shared/config'
import { Coins, Gem, ArrowRight, PackageOpen, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCachedImageUrl } from '@/shared/lib'
import { PriceDisplay } from '@/widgets/Market/ui/PriceDisplay'

interface Props {
	user: UserInfo
}

export function DesktopMarketWidget({ user }: Props) {
	const { products } = useMarket()

	const topmoney = user.points.diamonds.balance
	const topgems = user.points.coins.balance

	const topProducts = products.slice(0, 3)

	return (
		<div
			className="rounded-[28px] overflow-hidden border border-app-border bg-app-surface"
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div
				className="relative p-6 rounded-b-[28px] shadow-sm"
				style={{
					background: 'linear-gradient(135deg, var(--color-gradient-from) 0%, var(--color-gradient-to) 100%)',
				}}
			>
				<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl pointer-events-none" />

				<div className="relative flex items-center justify-between mb-5 h-16">
					<p className="text-white text-xl font-bold leading-snug flex items-center gap-2">
						<Store size={24} className="text-white/80" />
						Маркет
					</p>
					<Link
						to={pageConfig.market}
						className="text-white/90 text-sm font-medium hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-xl border border-white/20"
					>
						В магазин
						<ArrowRight size={14} />
					</Link>
				</div>

				<div className="relative">
					<p className="text-white/70 text-[11px] uppercase tracking-wider font-semibold mb-2">Ваш баланс (доступно)</p>
					<div className="grid grid-cols-2 gap-3">
						<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30 flex items-center gap-3">
							<div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
								<Coins size={18} className="text-[#FFD700]" />
							</div>
							<div className="min-w-0">
								<p className="text-[11px] text-white/70 leading-tight mb-0.5">Топмани</p>
								<p className="text-lg font-bold text-white leading-tight truncate">{topmoney.toLocaleString()}</p>
							</div>
						</div>
						<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30 flex items-center gap-3">
							<div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
								<Gem size={18} className="text-[#00D9FF]" />
							</div>
							<div className="min-w-0">
								<p className="text-[11px] text-white/70 leading-tight mb-0.5">Топгемы</p>
								<p className="text-lg font-bold text-white leading-tight truncate">{topgems.toLocaleString()}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{topProducts.length > 0 && (
				<div className="p-6 pt-4">
					<p className="text-app-muted text-[11px] uppercase tracking-wider font-semibold mb-3 px-1">Товары</p>
					<div className="bg-app-surface-hover rounded-2xl border border-app-border overflow-hidden">
						{topProducts.map((product, idx) => (
							<Link
								key={product.id}
								to={pageConfig.market}
								className={`group flex items-center gap-3 p-3 hover:bg-app-border/30 transition-colors ${
									idx !== topProducts.length - 1 ? 'border-b border-app-border' : ''
								}`}
							>
								<div className="w-12 h-12 shrink-0 rounded-xl bg-app-surface border border-app-border overflow-hidden flex items-center justify-center shadow-sm">
									{getCachedImageUrl(product.image_url) ? (
										<img
											src={getCachedImageUrl(product.image_url)!}
											alt={product.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<PackageOpen size={20} className="text-app-muted" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-app-text truncate">
										{product.title}
									</p>
									<div className="mt-1">
										<PriceDisplay price={product.price} className="text-xs" />
									</div>
								</div>
								<div className="w-8 h-8 rounded-full bg-app-surface flex items-center justify-center border border-app-border group-hover:bg-brand/10 transition-colors">
									<ArrowRight size={14} className="text-app-muted group-hover:text-brand transition-colors" />
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
