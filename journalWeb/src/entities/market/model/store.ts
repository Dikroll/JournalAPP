import { create } from "zustand";
import { persistEncrypted } from "@/shared/lib/zustandEncryptedPersist";
import type { LoadingState } from "@/shared/types";
import type {
	MarketCartItem,
	MarketOrder,
	MarketOrderDetails,
	MarketProduct,
} from "./types";

interface MarketState {
	products: MarketProduct[];
	productsStatus: LoadingState;
	productsError: string | null;
	productsLoadedAt: number | null;

	orders: MarketOrder[];
	ordersStatus: LoadingState;
	ordersError: string | null;
	ordersLoadedAt: number | null;

	orderDetails: Record<number, MarketOrderDetails>;
	orderDetailsStatus: Record<number, LoadingState>;

	cart: MarketCartItem[];

	setProducts: (products: MarketProduct[]) => void;
	setProductsStatus: (status: LoadingState) => void;
	setProductsError: (error: string | null) => void;
	setProductsLoadedAt: (loadedAt: number) => void;

	setOrders: (orders: MarketOrder[]) => void;
	setOrdersStatus: (status: LoadingState) => void;
	setOrdersError: (error: string | null) => void;
	setOrdersLoadedAt: (loadedAt: number) => void;
	setOrderDetails: (orderId: number, details: MarketOrderDetails) => void;
	setOrderDetailsStatus: (orderId: number, status: LoadingState) => void;

	addToCart: (productId: number, available: number) => void;
	removeFromCart: (productId: number) => void;
	incrementCartItem: (productId: number, available: number) => void;
	decrementCartItem: (productId: number) => void;
	clearCart: () => void;

	reset: () => void;
}

export const useMarketStore = create<MarketState>()(
	persistEncrypted(
		(set) => ({
			products: [],
			productsStatus: "idle",
			productsError: null,
			productsLoadedAt: null,

			orders: [],
			ordersStatus: "idle",
			ordersError: null,
			ordersLoadedAt: null,

			orderDetails: {},
			orderDetailsStatus: {},

			cart: [],

			setProducts: (products) => set({ products }),
			setProductsStatus: (productsStatus) => set({ productsStatus }),
			setProductsError: (productsError) => set({ productsError }),
			setProductsLoadedAt: (productsLoadedAt) => set({ productsLoadedAt }),

			setOrders: (orders) => set({ orders }),
			setOrdersStatus: (ordersStatus) => set({ ordersStatus }),
			setOrdersError: (ordersError) => set({ ordersError }),
			setOrdersLoadedAt: (ordersLoadedAt) => set({ ordersLoadedAt }),
			setOrderDetails: (orderId, details) =>
				set((state) => ({
					orderDetails: { ...state.orderDetails, [orderId]: details },
				})),
			setOrderDetailsStatus: (orderId, status) =>
				set((state) => ({
					orderDetailsStatus: {
						...state.orderDetailsStatus,
						[orderId]: status,
					},
				})),

			addToCart: (productId, available) =>
				set((state) => {
					const existing = state.cart.find(
						(item) => item.productId === productId,
					);
					if (existing) {
						return {
							cart: state.cart.map((item) =>
								item.productId === productId
									? {
											...item,
											quantity: Math.min(item.quantity + 1, available),
										}
									: item,
							),
						};
					}
					return { cart: [...state.cart, { productId, quantity: 1 }] };
				}),
			removeFromCart: (productId) =>
				set((state) => ({
					cart: state.cart.filter((item) => item.productId !== productId),
				})),
			incrementCartItem: (productId, available) =>
				set((state) => ({
					cart: state.cart.map((item) =>
						item.productId === productId
							? { ...item, quantity: Math.min(item.quantity + 1, available) }
							: item,
					),
				})),
			decrementCartItem: (productId) =>
				set((state) => ({
					cart: state.cart
						.map((item) =>
							item.productId === productId
								? { ...item, quantity: item.quantity - 1 }
								: item,
						)
						.filter((item) => item.quantity > 0),
				})),
			clearCart: () => set({ cart: [] }),

			reset: () =>
				set({
					products: [],
					productsStatus: "idle",
					productsError: null,
					productsLoadedAt: null,
					orders: [],
					ordersStatus: "idle",
					ordersError: null,
					ordersLoadedAt: null,
					orderDetails: {},
					orderDetailsStatus: {},
					cart: [],
				}),
		}),
		{
			name: "market-store",
			partialize: (state) => ({
				products: state.products,
				productsLoadedAt: state.productsLoadedAt,
				orders: state.orders,
				ordersLoadedAt: state.ordersLoadedAt,
				orderDetails: state.orderDetails,
				cart: state.cart,
			}),
		},
	),
);
