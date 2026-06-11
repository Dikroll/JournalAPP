import { PackageOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import type { MarketProduct } from "@/entities/market";
import { getCachedImageUrl } from "@/shared/lib";
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
	const fixedImageUrl = getCachedImageUrl(product.image_url);

	return (
		<>
			<article className="flex h-full flex-col overflow-hidden rounded-3xl border border-app-border bg-app-surface">
				<div
					className="h-36 shrink-0 bg-app-surface-hover cursor-pointer sm:h-40 xl:h-44"
					onClick={() => fixedImageUrl && setPhotoViewerOpen(true)}
				>
					{fixedImageUrl ? (
						<img
							src={fixedImageUrl}
							alt={product.title}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-app-muted">
							<PackageOpen size={36} />
						</div>
					)}
				</div>

				<div className="flex flex-1 flex-col gap-2 p-3.5">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-app-text">
								{product.title}
							</h2>
							<p className="mt-0.5 text-xs text-app-muted">
								В наличии: {product.quantity}
							</p>
						</div>
					</div>

					<p className="line-clamp-2 whitespace-pre-line text-[13px] leading-relaxed text-app-muted">
						{product.description}
					</p>

					<div className="mt-auto space-y-2 pt-0.5">
						<PriceDisplay price={product.price} className="text-sm" />

						{inCart > 0 ? (
							<button
								type="button"
								onClick={onRemove}
								className="h-9 w-full rounded-3xl border border-status-error/30 bg-status-error/10 px-3 text-xs font-semibold text-status-error transition hover:bg-status-error/20"
							>
								<div className="flex items-center justify-center gap-2 whitespace-nowrap">
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
								className="h-9 w-full rounded-3xl bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								В корзину
							</button>
						)}
					</div>
				</div>
			</article>

			{photoViewerOpen && fixedImageUrl && (
				<PhotoViewerModal
					src={fixedImageUrl}
					alt={product.title}
					onClose={() => setPhotoViewerOpen(false)}
				/>
			)}
		</>
	);
}
