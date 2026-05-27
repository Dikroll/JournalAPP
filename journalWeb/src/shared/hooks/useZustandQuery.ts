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
	const fetchingRef = useRef(false);
	const fetchFnRef = useRef(fetchFn);
	const updateStoreRef = useRef(updateStore);

	fetchFnRef.current = fetchFn;
	updateStoreRef.current = updateStore;

	useEffect(() => {
		if (fetchingRef.current) return;
		if (status === "loading") return;

		if (hasData && isCacheValid(loadedAt, ttlMs)) {
			if (status === "idle") updateStoreRef.current({ status: "success" });
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

		const cached = storage.get<T>(cacheKey);
		if (cached) {
			updateStoreRef.current({ data: cached, status: "success", loadedAt: Date.now(), error: null });
			return;
		}

		fetchingRef.current = true;
		updateStoreRef.current({ status: "loading", error: null });

		fetchFnRef.current()
			.then((data) => {
				updateStoreRef.current({ data, status: "success", loadedAt: Date.now(), error: null });
				storage.set(cacheKey, data, ttlMs / 1000);
			})
			.catch(() => {
				if (!hasData) updateStoreRef.current({ status: "error", error: errorMessage });
			})
			.finally(() => {
				fetchingRef.current = false;
			});
	}, [hasData, loadedAt, status, cacheKey, ttlMs, errorMessage]);

	const refresh = useCallback(async () => {
		if (fetchingRef.current) return;
		storage.remove(cacheKey);
		fetchingRef.current = true;
		updateStoreRef.current({ status: "loading", error: null });
		
		try {
			const data = await fetchFnRef.current();
			updateStoreRef.current({ data, status: "success", loadedAt: Date.now(), error: null });
			storage.set(cacheKey, data, ttlMs / 1000);
		} catch (err) {
			updateStoreRef.current({ status: "error", error: errorMessage });
		} finally {
			fetchingRef.current = false;
		}
	}, [cacheKey, ttlMs, errorMessage]);

	return { refresh };
}
