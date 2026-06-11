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
			className="bg-app-surface rounded-3xl p-4 border border-app-border block active:scale-[0.99] transition-transform"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-app-text text-sm font-bold flex items-center gap-2">
					<ShoppingBag size={16} className="text-app-muted shrink-0" />
					<span>Маркет</span>
				</h3>
				<span className="text-xs font-semibold text-brand">Открыть</span>
			</div>

			{topProducts.length > 0 && (
				<div className="flex flex-col gap-3">
					{topProducts.map((product, index) => {
						const imageUrl = getCachedImageUrl(product.image_url);

						return (
							<div key={product.id} className={`flex items-center gap-3`}>
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
