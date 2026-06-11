import { PackageOpen } from "lucide-react";
import { useState } from "react";
import type { MarketOrderProduct } from "@/entities/market";
import { getCachedImageUrl } from "@/shared/lib";
import { PhotoViewerModal } from "@/shared/ui";
import { PriceDisplay } from "./PriceDisplay";

interface Props {
	items: MarketOrderProduct[];
}

export function OrderItemsList({ items }: Props) {
	const [photoViewerOpen, setPhotoViewerOpen] = useState<string | null>(null);

	if (items.length === 0) {
		return <p className="text-sm text-app-muted pt-4">Товаров в заказе нет</p>;
	}

	const openedItem = items.find(
		(item, index) => `${item.id ?? index}` === photoViewerOpen,
	);

	return (
		<>
			<div className="pt-3 divide-y divide-app-border">
				{items.map((item, index) => {
					const title =
						item.title ??
						item.name ??
						`Товар #${item.product_id ?? item.id ?? "—"}`;
					const quantity = item.quantity ?? item.count ?? 1;
					const fixedImageUrl = getCachedImageUrl(item.image_url);

					return (
						<div key={item.id ?? index} className="flex gap-3 py-3 items-start">
							<div
								className="w-14 h-14 rounded-[12px] overflow-hidden bg-app-surface-hover shrink-0 cursor-pointer"
								onClick={() =>
									fixedImageUrl && setPhotoViewerOpen(`${item.id ?? index}`)
								}
							>
								{fixedImageUrl ? (
									<img
										src={fixedImageUrl}
										alt={title}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-app-muted">
										<PackageOpen size={20} />
									</div>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<div>
										<h3 className="text-sm font-semibold text-app-text">
											{title}
										</h3>
										<p className="text-xs text-app-muted mt-1">
											Кол-во: {quantity}
										</p>
									</div>
								</div>
								{item.price && (
									<PriceDisplay price={item.price} className="text-xs mt-2" />
								)}
							</div>
						</div>
					);
				})}
			</div>

			{photoViewerOpen && openedItem?.image_url && (
				<PhotoViewerModal
					src={getCachedImageUrl(openedItem.image_url) || openedItem.image_url}
					alt={openedItem.title ?? openedItem.name ?? "Товар"}
					onClose={() => setPhotoViewerOpen(null)}
				/>
			)}
		</>
	);
}
