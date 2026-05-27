import { type MarketPrice, useMarket } from '@/entities/market'
import { RefreshMarketButton } from '@/features/refreshMarket'
import { useSwipeBack } from '@/shared/hooks'
import type { Segment } from '@/shared/ui'
import { PageHeader, SegmentedControl } from '@/shared/ui'
import { CartItemCard, OrdersTab, PriceDisplay, ProductsTab } from '@/widgets'
import { Archive, ShoppingBag, ShoppingCart, ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

type MarketTab = "products" | "cart" | "orders";

function getMarketTabs(cartItemsCount: number): Segment<MarketTab>[] {
	return [
		{ key: "products", label: "Товары", icon: <ShoppingBag size={13} /> },
		{
			key: "cart",
			label: "Корзина",
			icon: <ShoppingCart size={13} />,
			badge: cartItemsCount > 0 ? cartItemsCount : undefined,
		},
		{ key: "orders", label: "Заказы", icon: <Archive size={13} /> },
	];
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

export function MarketPage() {
	const [tab, setTab] = useState<MarketTab>('products')
	const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
	const isDesktop = useIsDesktop()
	const navigate = useNavigate()
	const {
		products,
		productsStatus,
		productsError,
		orders,
		ordersStatus,
		ordersError,
		orderDetails,
		orderDetailsStatus,
		cartItems,
		cartTotal,
		addToCart,
		removeFromCart,
		incrementCartItem,
		decrementCartItem,
		loadOrderDetails,
		refresh,
	} = useMarket();

	const userBalance = { diamonds: 1000, coins: 5000 };
	useSwipeBack();
	const cartByProduct = useMemo(
		() => new Map(cartItems.map((item) => [item.productId, item.quantity])),
		[cartItems],
	);

	const handleToggleOrder = (orderId: number) => {
		const nextId = expandedOrderId === orderId ? null : orderId;
		setExpandedOrderId(nextId);
		if (nextId !== null) loadOrderDetails(orderId);
	};

	const handleAddToCart = (productId: number) => {
		const product = products.find((p) => p.id === productId);
		if (!product) return;

		const canAffordProduct = canAfford(product.price, userBalance);
		if (canAffordProduct) {
			addToCart(productId, 1);
		}
	};

	const handleRemoveFromCart = (productId: number) => {
		removeFromCart(productId);
	};

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<PageHeader title='Маркет' showBack={!isDesktop} />
					</div>
					<RefreshMarketButton
						isRefreshing={
							productsStatus === "loading" || ordersStatus === "loading"
						}
						onRefresh={refresh}
					/>
				</div>
				<SegmentedControl
					segments={getMarketTabs(cartItems.length)}
					active={tab}
					onChange={setTab}
				/>
			</div>

			<div className="px-4 space-y-4">
				{tab === "products" && (
					<ProductsTab
						products={products}
						cartByProduct={cartByProduct}
						productsStatus={productsStatus}
						productsError={productsError}
						userBalance={userBalance}
						onAddProduct={handleAddToCart}
						onRemoveProduct={handleRemoveFromCart}
					/>
				)}

				{tab === "cart" && (
					<div className="space-y-3">
						<div className="rounded-[20px] border border-amber-400/30 bg-amber-400/10 p-4">
							<p className="text-sm font-semibold text-amber-200">
								Оформление заказа в разработке
							</p>
							<p className="text-xs text-app-muted mt-1">
								Корзина сохраняется на устройстве, покупка через API пока не
								отправляется.
							</p>
						</div>

						{cartItems.length === 0 ? (
							<div className="py-16 text-center text-app-muted">
								Корзина пуста
							</div>
						) : (
							<>
								{cartItems.map(({ product, quantity }) => (
									<CartItemCard
										key={product.id}
										product={product}
										quantity={quantity}
										onIncrement={() =>
											incrementCartItem(product.id, product.quantity)
										}
										onDecrement={() => decrementCartItem(product.id)}
										onRemove={() => removeFromCart(product.id)}
									/>
								))}

								<div className="bg-app-surface rounded-[20px] border border-app-border p-4 space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-app-muted">Итого</span>
										<PriceDisplay price={cartTotal} className="text-base" />
									</div>

									<div className="pt-3 border-t border-app-border">
										<p className="text-xs text-app-muted mb-2">Ваш баланс:</p>
										<PriceDisplay price={userBalance} className="text-sm" />
									</div>
								</div>

								<button
									type="button"
									disabled
									className="w-full h-12 rounded-[18px] bg-brand text-white text-sm font-semibold opacity-50"
								>
									Оформить заказ
								</button>
							</>
						)}
					</div>
				)}

				{tab === "orders" && (
					<OrdersTab
						ordersStatus={ordersStatus}
						ordersError={ordersError}
						orders={orders}
						expandedOrderId={expandedOrderId}
						orderDetails={orderDetails}
						orderDetailsStatus={orderDetailsStatus}
						onOrderToggle={handleToggleOrder}
						cartItems={[]}
						cartTotal={cartTotal}
						userBalance={userBalance}
						onCartIncrement={incrementCartItem}
						onCartDecrement={decrementCartItem}
						onCartRemove={removeFromCart}
					/>
				)}
			</div>
		</div>
	);
}
