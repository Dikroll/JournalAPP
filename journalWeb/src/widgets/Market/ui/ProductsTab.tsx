import type { MarketPrice, MarketProduct } from "@/entities/market";
import { Badge, SkeletonList } from "@/shared/ui";
import { PriceDisplay } from "./PriceDisplay";
import { ProductCard } from "./ProductCard";

interface Props {
	products: MarketProduct[];
	cartByProduct: Map<number, number>;
	productsStatus: "idle" | "loading" | "error" | "success";
	productsError: string | null;
	userBalance: MarketPrice;
	onAddProduct: (productId: number) => void;
	onRemoveProduct: (productId: number) => void;
}

function canAfford(price: MarketPrice, userBalance: MarketPrice): boolean {
	if (
		price.diamonds &&
		(!userBalance.diamonds || userBalance.diamonds < price.diamonds)
	) {
		return false;
	}
	if (price.coins && (!userBalance.coins || userBalance.coins < price.coins)) {
		return false;
	}
	return true;
}

export function ProductsTab({
	products,
	cartByProduct,
	productsStatus,
	productsError,
	userBalance,
	onAddProduct,
	onRemoveProduct,
}: Props) {
	return (
		<>
			<div className="flex items-center justify-between">
				{products.length > 0 ? (
					<Badge variant="neutral" size="xs">
						Товары: {products.length}
					</Badge>
				) : (
					<div />
				)}
				<div className="flex items-center gap-2">
					<span className="text-xs text-app-muted">Баланс:</span>
					<PriceDisplay price={userBalance} className="text-sm font-medium" />
				</div>
			</div>
			{productsStatus === "loading" && products.length === 0 ? (
				<SkeletonList count={4} height={260} />
			) : productsStatus === "error" && products.length === 0 ? (
				<div className="py-16 text-center text-app-muted">
					{productsError ?? "Не удалось загрузить товары"}
				</div>
			) : products.length === 0 ? (
				<div className="py-16 text-center text-app-muted">
					Товары скоро появятся
				</div>
			) : (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] items-stretch gap-3.5">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							inCart={cartByProduct.get(product.id) ?? 0}
							canAddToCart={canAfford(product.price, userBalance)}
							onAdd={() => onAddProduct(product.id)}
							onRemove={() => onRemoveProduct(product.id)}
						/>
					))}
				</div>
			)}
		</>
	);
}
