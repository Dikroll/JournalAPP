import { ArrowRight, PackageOpen, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useMarket } from "@/entities/market";
import { pageConfig } from "@/shared/config";
import { getCachedImageUrl } from "@/shared/lib";
import { PriceDisplay } from "@/widgets/Market/ui/PriceDisplay";

export function MarketLink() {
	const { products } = useMarket();
	const topProducts = products.slice(0, 3);

	return (
		<Link
			to={pageConfig.market}
			className="bg-app-surface rounded-[20px] p-4 border border-app-border block active:scale-[0.99] transition-transform"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-11 h-11 rounded-[16px] bg-brand/10 flex items-center justify-center text-white">
						<ShoppingBag size={21} />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-app-text">Маркет</p>
						<p className="text-xs text-app-muted mt-0.5 truncate">
							Товары за топмани и топгемы
						</p>
					</div>
				</div>
				<span className="text-sm text-brand font-medium shrink-0">Открыть</span>
			</div>

			{topProducts.length > 0 && (
				<div className="mt-4 rounded-2xl border border-app-border bg-app-surface-hover overflow-hidden">
					{topProducts.map((product, index) => {
						const imageUrl = getCachedImageUrl(product.image_url);

						return (
							<div
								key={product.id}
								className={`flex items-center gap-3 p-3 ${
									index !== topProducts.length - 1
										? "border-b border-app-border"
										: ""
								}`}
							>
								<div className="w-11 h-11 shrink-0 rounded-xl bg-app-surface border border-app-border overflow-hidden flex items-center justify-center">
									{imageUrl ? (
										<img
											src={imageUrl}
											alt={product.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<PackageOpen size={18} className="text-app-muted" />
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
								<ArrowRight size={14} className="text-app-muted shrink-0" />
							</div>
						);
					})}
				</div>
			)}
		</Link>
	);
}
