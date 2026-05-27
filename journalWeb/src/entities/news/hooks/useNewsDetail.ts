import { useState } from "react";
import { ttl } from "@/shared/config";
import { CACHE_KEYS } from "@/shared/lib";
import { useZustandQuery } from "@/shared/hooks/useZustandQuery";
import { newsApi } from "../api";
import { useNewsStore } from "../model/store";

export function useNewsDetail(id: number) {
	const detail = useNewsStore((s) => s.details[id]);
	const setDetail = useNewsStore((s) => s.setDetail);
	const markAsRead = useNewsStore((s) => s.markAsRead);

	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>(detail ? "success" : "idle");
	const [error, setError] = useState<string | null>(null);
	useZustandQuery({
		cacheKey: CACHE_KEYS.NEWS_DETAIL(id),
		ttlMs: ttl.ACTIVITY * 2 * 1000,
		loadedAt: null,
		status,
		hasData: !!detail,
		fetchFn: () => newsApi.getDetail(id),
		updateStore: (state) => {
			setStatus(state.status as any);
			if (state.error !== undefined) setError(state.error);
			if (state.data) {
				setDetail(id, state.data);
				markAsRead(id);
			}
		},
		errorMessage: "Не удалось загрузить новость",
	});

	return { detail, status, error };
}
