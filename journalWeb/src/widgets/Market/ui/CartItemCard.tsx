import { Box, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { MarketProduct } from "@/entities/market";
import { getCachedImageUrl } from "@/shared/lib";
import { PhotoViewerModal } from "@/shared/ui";
import { PriceDisplay } from "./PriceDisplay";

interface Props {
	product: MarketProduct;
	quantity: number;
	onIncrement: () => void;
	onDecrement: () => void;
	onRemove: () => void;
}

export function CartItemCard({
	product,
	quantity,
	onIncrement,
	onDecrement,
	onRemove,
}: Props) {
	const canIncrement = quantity < product.quantity;
	const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
	const fixedImageUrl = getCachedImageUrl(product.image_url);

	return (
		<>
			<div className="bg-app-surface rounded-3xl border border-app-border p-4 flex gap-3">
				<div
					className="w-16 h-16 rounded-[16px] overflow-hidden bg-app-surface-hover shrink-0 cursor-pointer"
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
							<Box size={22} />
						</div>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<div>
							<h2 className="text-sm font-semibold text-app-text">
								{product.title}
							</h2>
							<div className="mt-1">
								<PriceDisplay price={product.price} className="text-xs" />
							</div>
						</div>
						<button
							type="button"
							onClick={onRemove}
							className="w-9 h-9 rounded-full border border-app-border flex items-center justify-center text-app-muted hover:text-status-error transition"
						>
							<Trash2 size={16} />
						</button>
					</div>

					<div className="mt-3 flex items-center gap-2">
						<button
							type="button"
							onClick={onDecrement}
							className="w-9 h-9 rounded-full border border-app-border flex items-center justify-center hover:bg-app-surface-hover transition"
						>
							<Minus size={16} />
						</button>
						<span className="w-10 text-center text-sm font-semibold">
							{quantity}
						</span>
						<button
							type="button"
							onClick={onIncrement}
							disabled={!canIncrement}
							className="w-9 h-9 rounded-full border border-app-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-app-surface-hover transition"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>
			</div>

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
