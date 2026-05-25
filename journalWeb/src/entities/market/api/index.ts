import { api } from "@/shared/api";
import { apiConfig } from "@/shared/config";
import type {
	MarketOrder,
	MarketOrderDetails,
	MarketProduct,
} from "../model/types";

export const MARKET_PAGE_SIZE = 10;

export const marketApi = {
	getProductsPage: (page = 1) =>
		api
			.get<MarketProduct[]>(apiConfig.MARKET_PRODUCTS, { params: { page } })
			.then((r) => r.data),

	getAllProducts: async () => {
		const products: MarketProduct[] = [];
		let page = 1;

		while (true) {
			const pageItems = await marketApi.getProductsPage(page);
			products.push(...pageItems);

			if (pageItems.length < MARKET_PAGE_SIZE) break;
			page += 1;
		}

		return products;
	},

	getOrders: () =>
		api.get<MarketOrder[]>(apiConfig.MARKET_ORDERS).then((r) => r.data),

	getOrderDetails: (orderId: number) =>
		api
			.get<MarketOrderDetails>(`${apiConfig.MARKET_ORDERS}/${orderId}`)
			.then((r) => r.data),
};
