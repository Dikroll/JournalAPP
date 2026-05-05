import {
	type MarketOrderDetails,
	type MarketPrice,
	useMarket,
} from '@/entities/market'
import { useSwipeBack } from '@/shared/hooks'
import type { Segment } from '@/shared/ui'
import {
	Badge,
	PageHeader,
	RefreshButton,
	SegmentedControl,
	SkeletonList,
} from '@/shared/ui'
import {
	CartItemCard,
	OrderCard,
	OrderItemsList,
	PriceDisplay,
	ProductCard,
} from '@/widgets'
import { Archive, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'

type MarketTab = 'products' | 'cart' | 'orders'

function getMarketTabs(cartItemsCount: number): Segment<MarketTab>[] {
	return [
		{ key: 'products', label: 'Товары', icon: <ShoppingBag size={13} /> },
		{
			key: 'cart',
			label: 'Корзина',
			icon: <ShoppingCart size={13} />,
			badge: cartItemsCount > 0 ? cartItemsCount : undefined,
		},
		{ key: 'orders', label: 'Заказы', icon: <Archive size={13} /> },
	]
}

function getOrderItems(details?: MarketOrderDetails) {
	return details?.products ?? details?.items ?? []
}

function canAfford(price: MarketPrice, userBalance: MarketPrice): boolean {
	if (
		price.diamonds &&
		(!userBalance.diamonds || userBalance.diamonds < price.diamonds)
	) {
		return false
	}
	if (price.coins && (!userBalance.coins || userBalance.coins < price.coins)) {
		return false
	}
	return true
}

export function MarketPage() {
	const [tab, setTab] = useState<MarketTab>('products')
	const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
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
	} = useMarket()

	const userBalance = { diamonds: 1000, coins: 5000 }
	useSwipeBack()
	const cartByProduct = useMemo(
		() => new Map(cartItems.map(item => [item.productId, item.quantity])),
		[cartItems],
	)

	const handleToggleOrder = (orderId: number) => {
		const nextId = expandedOrderId === orderId ? null : orderId
		setExpandedOrderId(nextId)
		if (nextId !== null) loadOrderDetails(orderId)
	}

	const handleAddToCart = (productId: number) => {
		const product = products.find(p => p.id === productId)
		if (!product) return

		const canAffordProduct = canAfford(product.price, userBalance)
		if (canAffordProduct) {
			addToCart(productId, 1)
		}
	}

	const handleRemoveFromCart = (productId: number) => {
		removeFromCart(productId)
	}

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-3'>
				<div className='flex items-center justify-between'>
					<PageHeader title='Маркет' />
					<RefreshButton
						isRefreshing={
							productsStatus === 'loading' || ordersStatus === 'loading'
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

			<div className='px-4 space-y-4'>
				{tab === 'products' && (
					<>
						{products.length > 0 && (
							<div className='flex items-center gap-2'>
								<Badge variant='neutral' size='xs'>
									Товары: {products.length}
								</Badge>
							</div>
						)}
						{productsStatus === 'loading' && products.length === 0 ? (
							<SkeletonList count={4} height={260} />
						) : productsStatus === 'error' && products.length === 0 ? (
							<div className='py-16 text-center text-app-muted'>
								{productsError ?? 'Не удалось загрузить товары'}
							</div>
						) : products.length === 0 ? (
							<div className='py-16 text-center text-app-muted'>
								Товары скоро появятся
							</div>
						) : (
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								{products.map(product => (
									<ProductCard
										key={product.id}
										product={product}
										inCart={cartByProduct.get(product.id) ?? 0}
										canAddToCart={canAfford(product.price, userBalance)}
										onAdd={() => handleAddToCart(product.id)}
										onRemove={() => handleRemoveFromCart(product.id)}
									/>
								))}
							</div>
						)}
					</>
				)}

				{tab === 'cart' && (
					<div className='space-y-3'>
						<div className='rounded-[20px] border border-amber-400/30 bg-amber-400/10 p-4'>
							<p className='text-sm font-semibold text-amber-200'>
								Оформление заказа в разработке
							</p>
							<p className='text-xs text-app-muted mt-1'>
								Корзина сохраняется на устройстве, покупка через API пока не
								отправляется.
							</p>
						</div>

						{cartItems.length === 0 ? (
							<div className='py-16 text-center text-app-muted'>
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

								<div className='bg-app-surface rounded-[20px] border border-app-border p-4 space-y-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm text-app-muted'>Итого</span>
										<PriceDisplay price={cartTotal} className='text-base' />
									</div>

									<div className='pt-3 border-t border-app-border'>
										<p className='text-xs text-app-muted mb-2'>Ваш баланс:</p>
										<PriceDisplay price={userBalance} className='text-sm' />
									</div>
								</div>

								<button
									type='button'
									disabled
									className='w-full h-12 rounded-[18px] bg-brand text-white text-sm font-semibold opacity-50'
								>
									Оформить заказ
								</button>
							</>
						)}
					</div>
				)}

				{tab === 'orders' && (
					<div className='space-y-3'>
						{ordersStatus === 'loading' && orders.length === 0 ? (
							<SkeletonList count={4} height={96} />
						) : ordersStatus === 'error' && orders.length === 0 ? (
							<div className='py-16 text-center text-app-muted'>
								{ordersError ?? 'Не удалось загрузить заказы'}
							</div>
						) : orders.length === 0 ? (
							<div className='py-16 text-center text-app-muted'>
								Заказов пока нет
							</div>
						) : (
							orders.map(order => {
								const isExpanded = expandedOrderId === order.id
								const details = orderDetails[order.id]
								const items = getOrderItems(details)

								return (
									<OrderCard
										key={order.id}
										order={order}
										isExpanded={isExpanded}
										onToggle={() => handleToggleOrder(order.id)}
										isLoading={orderDetailsStatus[order.id] === 'loading'}
										isError={orderDetailsStatus[order.id] === 'error'}
										totalPrice={details?.total}
									>
										<OrderItemsList items={items} />
									</OrderCard>
								)
							})
						)}
					</div>
				)}
			</div>
		</div>
	)
}
