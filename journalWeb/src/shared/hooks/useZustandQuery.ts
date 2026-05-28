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
			// Already fetching, we can optionally wait for it or just let the initiator update the store
			return;
		}

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

		updateStoreRef.current({ status: "loading", error: null });

		const promise = fetchFnRef.current()
			.then((data) => {
				updateStoreRef.current({ data, status: "success", loadedAt: Date.now(), error: null });
				storage.set(cacheKey, data, ttlMs / 1000);
				return data;
			})
			.catch((err) => {
				if (!hasData) updateStoreRef.current({ status: "error", error: errorMessage });
				throw err;
			})
			.finally(() => {
				fetchingPromises.delete(cacheKey);
			});

		fetchingPromises.set(cacheKey, promise);
	}, [hasData, loadedAt, status, cacheKey, ttlMs, errorMessage]);

	const refresh = useCallback(async () => {
		if (fetchingPromises.has(cacheKey)) {
			try {
				await fetchingPromises.get(cacheKey);
			} catch (e) {
				// ignore
			}
			return;
		}

		storage.remove(cacheKey);
		updateStoreRef.current({ status: "loading", error: null });
		
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
		} catch (err) {
			// ignore, handled in then/catch above
		}
	}, [cacheKey, ttlMs, errorMessage]);

	return { refresh };
}
