import type {
	MarketOrder,
	MarketOrderDetails,
	MarketPrice,
} from '@/entities/market'
import { SkeletonList } from '@/shared/ui'
import { OrderCard } from './OrderCard'
import { OrderItemsList } from './OrderItemsList'

interface CartItem {
	product: { id: number; title: string; image_url?: string; price: MarketPrice }
	quantity: number
}

interface Props {
	cartItems: CartItem[]
	cartTotal: MarketPrice
	userBalance: MarketPrice
	ordersStatus: 'idle' | 'loading' | 'error' | 'success'
	ordersError: string | null
	orders: MarketOrder[]
	expandedOrderId: number | null
	orderDetails: Record<number, MarketOrderDetails | undefined>
	orderDetailsStatus: Record<string, 'idle' | 'loading' | 'error' | 'success'>
	onOrderToggle: (orderId: number) => void
	onCartIncrement: (productId: number, maxQuantity: number) => void
	onCartDecrement: (productId: number) => void
	onCartRemove: (productId: number) => void
}

function getOrderItems(details?: MarketOrderDetails) {
	return details?.products ?? details?.items ?? []
}

export function OrdersTab({
	ordersStatus,
	ordersError,
	orders,
	expandedOrderId,
	orderDetails,
	orderDetailsStatus,
	onOrderToggle,
}: Props) {
	return (
		<div className='space-y-3'>
			{ordersStatus === 'loading' && orders.length === 0 ? (
				<SkeletonList count={4} height={96} />
			) : ordersStatus === 'error' && orders.length === 0 ? (
				<div className='py-16 text-center text-app-muted'>
					{ordersError ?? 'Не удалось загрузить заказы'}
				</div>
			) : orders.length === 0 ? (
				<div className='py-16 text-center text-app-muted'>Заказов пока нет</div>
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
							onToggle={() => onOrderToggle(order.id)}
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
	)
}
