import { ttl } from "@/shared/config";
import { CACHE_KEYS } from "@/shared/lib";
import { newsApi } from "../api";
import { useZustandQuery } from "@/shared/hooks/useZustandQuery";
import { useNewsStore } from "../model/store";

export function useNews() {
	const { latest, status, error, loadedAt, update } = useNewsStore();
	const { refresh } = useZustandQuery({
		cacheKey: CACHE_KEYS.NEWS,
		ttlMs: ttl.ACTIVITY * 1000,
		loadedAt,
		status,
		hasData: latest.length > 0,
		fetchFn: () => newsApi.getLatest(),
		updateStore: (state) => {
			if (state.data !== undefined) {
				update({ latest: state.data, status: state.status as any, loadedAt: state.loadedAt, error: state.error });
			} else {
				update({ status: state.status as any, error: state.error });
			}
		},
		errorMessage: "Не удалось загрузить новости",
	});

	return { latest, status, error, refresh };
}
