import type { LoadingState } from "@/shared/types";

export interface MarketPrice {
	diamonds?: number;
	coins?: number;
}

export interface MarketProduct {
	id: number;
	title: string;
	description: string;
	quantity: number;
	image_url: string | null;
	price: MarketPrice;
}

export interface MarketOrder {
	id: number;
	created_at: string;
	status: number;
}

export interface MarketOrderProduct {
	id?: number;
	product_id?: number;
	title?: string;
	name?: string;
	quantity?: number;
	count?: number;
	price?: MarketPrice;
	image_url?: string | null;
}

export interface MarketOrderDetails extends MarketOrder {
	products?: MarketOrderProduct[];
	items?: MarketOrderProduct[];
	total?: MarketPrice;
}

export interface MarketCartItem {
	productId: number;
	quantity: number;
}

export interface MarketStateSnapshot {
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
}
