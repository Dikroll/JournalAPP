import { api } from "@/shared/api";
import type { NewsDetail, NewsItem } from "../model/types";

export const newsApi = {
	getLatest: async (): Promise<NewsItem[]> => {
		const res = await api.get("/news/latest");
		return res.data;
	},

	getDetail: async (id: number): Promise<NewsDetail> => {
		const res = await api.get("/news/detail", { params: { news_id: id } });
		return res.data;
	},
};
