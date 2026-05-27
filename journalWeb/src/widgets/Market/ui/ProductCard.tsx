import { PackageOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import type { MarketProduct } from "@/entities/market";
import { PhotoViewerModal } from "@/shared/ui";
import { PriceDisplay } from "./PriceDisplay";

interface Props {
	product: MarketProduct;
	inCart: number;
	canAddToCart: boolean;
	onAdd: () => void;
	onRemove: () => void;
}

export function ProductCard({
	product,
	inCart,
	canAddToCart,
	onAdd,
	onRemove,
}: Props) {
	const isSoldOut = product.quantity <= 0;
	const [photoViewerOpen, setPhotoViewerOpen] = useState(false);

	return (
		<>
			<article className="bg-app-surface rounded-3xl border border-app-border overflow-hidden">
				<div
					className="aspect-video bg-app-surface-hover cursor-pointer"
					onClick={() => product.image_url && setPhotoViewerOpen(true)}
				>
					{product.image_url ? (
						<img
							src={product.image_url}
							alt={product.title}
							loading="lazy"
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-app-muted">
							<PackageOpen size={36} />
						</div>
					)}
				</div>

				<div className="p-4 space-y-3">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="text-base font-semibold text-app-text leading-snug">
								{product.title}
							</h2>
							<p className="text-xs text-app-muted mt-1">
								В наличии: {product.quantity}
							</p>
						</div>
					</div>

					<p className="text-sm text-app-muted whitespace-pre-line leading-relaxed">
						{product.description}
					</p>

					<PriceDisplay price={product.price} className="text-sm" />

					<div className="space-y-2 pt-2">
						{inCart > 0 ? (
							<button
								type="button"
								onClick={onRemove}
								className="w-full h-9 px-3 rounded-2xl bg-status-error/10 text-status-error text-xs font-semibold border border-status-error/30 transition hover:bg-status-error/20"
							>
								<div className="flex items-center justify-center gap-2">
									<Trash2 size={14} />
									Убрать из корзины
								</div>
							</button>
						) : (
							<button
								type="button"
								onClick={onAdd}
								disabled={isSoldOut || !canAddToCart}
								title={!canAddToCart ? "Не хватает средств" : ""}
								className="w-full h-9 px-3 rounded-2xl bg-brand text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-brand/90"
							>
								В корзину
							</button>
						)}
					</div>
				</div>
			</article>

			{photoViewerOpen && product.image_url && (
				<PhotoViewerModal
					src={product.image_url}
					alt={product.title}
					onClose={() => setPhotoViewerOpen(false)}
				/>
			)}
		</>
	);
}
