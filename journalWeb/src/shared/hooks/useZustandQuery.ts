import { useEffect, useRef, useCallback } from "react";
import { isCacheValid } from "../lib/isCacheValid";
import { getIsOnline } from "../model/networkStore";
import { storage } from "../lib/encryptedStorage";

export interface ZustandQueryOptions<T> {
	cacheKey: string;
	ttlMs: number;
	loadedAt: number | null;
	status: string;
	hasData: boolean;
	fetchFn: () => Promise<T>;
	updateStore: (state: { status: string; loadedAt?: number; error?: string | null; data?: T }) => void;
	errorMessage?: string;
}

const fetchingPromises = new Map<string, Promise<any>>();

/** Clear all in-flight dedup entries. Call on logout / account switch. */
export function resetZustandQueryFetch() {
	fetchingPromises.clear();
}

/**
 * Stale-While-Revalidate (SWR) strategy:
 * - If we have data → show it immediately as "success"
 * - Always revalidate from API in the background (respecting a short dedup window)
 * - When fresh data arrives → update the store silently
 * - Only show "loading" spinner when there's NO data at all
 */
export function useZustandQuery<T>({
	cacheKey,
	ttlMs,
	loadedAt,
	status,
	hasData,
	fetchFn,
	updateStore,
	errorMessage = "Ошибка загрузки",
}: ZustandQueryOptions<T>) {
	const fetchFnRef = useRef(fetchFn);
	const updateStoreRef = useRef(updateStore);

	fetchFnRef.current = fetchFn;
	updateStoreRef.current = updateStore;

	useEffect(() => {
		if (fetchingPromises.has(cacheKey)) {
			// Already fetching — just make sure data is visible
			if (hasData && status === "idle") {
				updateStoreRef.current({ status: "success" });
			}
			return;
		}

		if (status === "loading") return;

		// SWR: if we have data, show it right away regardless of cache validity
		if (hasData && status === "idle") {
			updateStoreRef.current({ status: "success" });
		}

		// If cache is still fresh, skip the revalidation fetch
		if (hasData && isCacheValid(loadedAt, ttlMs)) {
			return;
		}

		if (!getIsOnline()) {
			if (hasData || loadedAt !== null) {
				if (status === "idle") updateStoreRef.current({ status: "success" });
				return;
			}
			updateStoreRef.current({ status: "error", error: "Нет подключения к интернету" });
			return;
		}

		// Try localStorage cache only when we have NO data at all
		if (!hasData) {
			const cached = storage.get<T>(cacheKey);
			if (cached) {
				updateStoreRef.current({ data: cached, status: "success", loadedAt: Date.now(), error: null });
				// Don't return — still revalidate below
			}
		}

		// Only show loading spinner if there's no data to display
		if (!hasData) {
			updateStoreRef.current({ status: "loading", error: null });
		}

		// Always fetch from API (background revalidation)
		const promise = fetchFnRef.current()
			.then((data) => {
				updateStoreRef.current({ data, status: "success", loadedAt: Date.now(), error: null });
				storage.set(cacheKey, data, ttlMs / 1000);
				return data;
			})
			.catch((err) => {
				// Only show error state if there's no stale data to display
				if (!hasData) {
					updateStoreRef.current({ status: "error", error: errorMessage });
				}
				throw err;
			})
			.finally(() => {
				fetchingPromises.delete(cacheKey);
			});

		fetchingPromises.set(cacheKey, promise);
	}, [hasData, loadedAt, status, cacheKey, ttlMs, errorMessage]);

	const refresh = useCallback(async () => {
		// Manual refresh always forces a new fetch
		if (fetchingPromises.has(cacheKey)) {
			fetchingPromises.delete(cacheKey);
		}

		storage.remove(cacheKey);

		// Only show loading if no data
		if (!hasData) {
			updateStoreRef.current({ status: "loading", error: null });
		}

		const promise = fetchFnRef.current()
			.then((data) => {
				updateStoreRef.current({ data, status: "success", loadedAt: Date.now(), error: null });
				storage.set(cacheKey, data, ttlMs / 1000);
				return data;
			})
			.catch((err) => {
				updateStoreRef.current({ status: "error", error: errorMessage });
				throw err;
			})
			.finally(() => {
				fetchingPromises.delete(cacheKey);
			});

		fetchingPromises.set(cacheKey, promise);

		try {
			await promise;
		} catch {
			// handled above
		}
	}, [cacheKey, hasData, ttlMs, errorMessage]);

	return { refresh };
}
