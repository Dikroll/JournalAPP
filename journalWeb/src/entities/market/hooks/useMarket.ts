import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { getIsOnline } from '@/shared/model/networkStore'
import { useCallback, useEffect, useMemo } from 'react'
import { marketApi } from '../api'
import { useMarketStore } from '../model/store'
import type { MarketPrice } from '../model/types'

const CACHE_TTL_MS = ttl.MARKET * 1000

const productsLoading = new Map<string, Promise<void>>()
const ordersLoading = new Map<string, Promise<void>>()
const detailsLoading = new Map<number, Promise<void>>()

function addPrice(target: MarketPrice, source: MarketPrice, multiplier = 1) {
	return {
		diamonds: (target.diamonds ?? 0) + (source.diamonds ?? 0) * multiplier,
		coins: (target.coins ?? 0) + (source.coins ?? 0) * multiplier,
	}
}

async function runLoadProducts(force: boolean) {
	const store = useMarketStore.getState()
	if (!force && isCacheValid(store.productsLoadedAt, CACHE_TTL_MS)) {
		if (store.productsStatus === 'idle') store.setProductsStatus('success')
		return
	}

	if (productsLoading.has('all')) {
		await productsLoading.get('all')
		return
	}

	if (!getIsOnline()) {
		if (store.products.length > 0) {
			store.setProductsStatus('success')
			return
		}
		store.setProductsError('Нет подключения к интернету')
		store.setProductsStatus('error')
		return
	}

	store.setProductsStatus('loading')
	store.setProductsError(null)

	const promise = (async () => {
		try {
			const products = await marketApi.getAllProducts()
			const latest = useMarketStore.getState()
			latest.setProducts(products)
			latest.setProductsLoadedAt(Date.now())
			latest.setProductsStatus('success')
		} catch {
			const latest = useMarketStore.getState()
			latest.setProductsError('Не удалось загрузить товары')
			if (latest.products.length === 0) latest.setProductsStatus('error')
		} finally {
			productsLoading.delete('all')
		}
	})()

	productsLoading.set('all', promise)
	await promise
}

async function runLoadOrders(force: boolean) {
	const store = useMarketStore.getState()
	if (!force && isCacheValid(store.ordersLoadedAt, CACHE_TTL_MS)) {
		if (store.ordersStatus === 'idle') store.setOrdersStatus('success')
		return
	}

	if (ordersLoading.has('all')) {
		await ordersLoading.get('all')
		return
	}

	if (!getIsOnline()) {
		if (store.orders.length > 0) {
			store.setOrdersStatus('success')
			return
		}
		store.setOrdersError('Нет подключения к интернету')
		store.setOrdersStatus('error')
		return
	}

	store.setOrdersStatus('loading')
	store.setOrdersError(null)

	const promise = (async () => {
		try {
			const orders = await marketApi.getOrders()
			const latest = useMarketStore.getState()
			latest.setOrders(orders)
			latest.setOrdersLoadedAt(Date.now())
			latest.setOrdersStatus('success')
		} catch {
			const latest = useMarketStore.getState()
			latest.setOrdersError('Не удалось загрузить заказы')
			if (latest.orders.length === 0) latest.setOrdersStatus('error')
		} finally {
			ordersLoading.delete('all')
		}
	})()

	ordersLoading.set('all', promise)
	await promise
}

async function runLoadOrderDetails(orderId: number) {
	const store = useMarketStore.getState()
	if (store.orderDetails[orderId]) return
	if (detailsLoading.has(orderId)) {
		await detailsLoading.get(orderId)
		return
	}
	if (!getIsOnline()) return

	store.setOrderDetailsStatus(orderId, 'loading')

	const promise = (async () => {
		try {
			const details = await marketApi.getOrderDetails(orderId)
			const latest = useMarketStore.getState()
			latest.setOrderDetails(orderId, details)
			latest.setOrderDetailsStatus(orderId, 'success')
		} catch {
			useMarketStore.getState().setOrderDetailsStatus(orderId, 'error')
		} finally {
			detailsLoading.delete(orderId)
		}
	})()

	detailsLoading.set(orderId, promise)
	await promise
}

export function useMarket() {
	const products = useMarketStore(s => s.products)
	const productsStatus = useMarketStore(s => s.productsStatus)
	const productsError = useMarketStore(s => s.productsError)
	const orders = useMarketStore(s => s.orders)
	const ordersStatus = useMarketStore(s => s.ordersStatus)
	const ordersError = useMarketStore(s => s.ordersError)
	const orderDetails = useMarketStore(s => s.orderDetails)
	const orderDetailsStatus = useMarketStore(s => s.orderDetailsStatus)
	const cart = useMarketStore(s => s.cart)
	const addToCart = useMarketStore(s => s.addToCart)
	const removeFromCart = useMarketStore(s => s.removeFromCart)
	const incrementCartItem = useMarketStore(s => s.incrementCartItem)
	const decrementCartItem = useMarketStore(s => s.decrementCartItem)
	const clearCart = useMarketStore(s => s.clearCart)

	const loadProducts = useCallback((force = false) => runLoadProducts(force), [])
	const loadOrders = useCallback((force = false) => runLoadOrders(force), [])
	const loadOrderDetails = useCallback(
		(orderId: number) => runLoadOrderDetails(orderId),
		[],
	)
	const refresh = useCallback(
		() => Promise.all([loadProducts(true), loadOrders(true)]).then(() => undefined),
		[loadProducts, loadOrders],
	)

	useEffect(() => {
		loadProducts()
		loadOrders()
	}, [loadProducts, loadOrders])

	const cartItems = useMemo(
		() =>
			cart
				.map(item => {
					const product = products.find(p => p.id === item.productId)
					if (!product) return null
					return { ...item, product }
				})
				.filter((item): item is NonNullable<typeof item> => item !== null),
		[cart, products],
	)

	const cartTotal = useMemo(
		() =>
			cartItems.reduce(
				(total, item) => addPrice(total, item.product.price, item.quantity),
				{} as MarketPrice,
			),
		[cartItems],
	)

	return {
		products,
		productsStatus,
		productsError,
		orders,
		ordersStatus,
		ordersError,
		orderDetails,
		orderDetailsStatus,
		cart,
		cartItems,
		cartTotal,
		addToCart,
		removeFromCart,
		incrementCartItem,
		decrementCartItem,
		clearCart,
		loadOrderDetails,
		refresh,
	}
}
