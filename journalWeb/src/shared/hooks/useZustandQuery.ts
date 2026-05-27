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

	useEffect(() => {
		if (fetchingRef.current) return;
		if (status === "loading") return;

		if (hasData && isCacheValid(loadedAt, ttlMs)) {
			if (status === "idle") updateStore({ status: "success" });
			return;
		}

		if (!getIsOnline()) {
			if (hasData || loadedAt !== null) {
				if (status === "idle") updateStore({ status: "success" });
				return;
			}
			updateStore({ status: "error", error: "Нет подключения к интернету" });
			return;
		}

		const cached = storage.get<T>(cacheKey);
		if (cached) {
			updateStore({ data: cached, status: "success", loadedAt: Date.now(), error: null });
			return;
		}

		fetchingRef.current = true;
		updateStore({ status: "loading", error: null });

		fetchFn()
			.then((data) => {
				updateStore({ data, status: "success", loadedAt: Date.now(), error: null });
				storage.set(cacheKey, data, ttlMs / 1000);
			})
			.catch(() => {
				if (!hasData) updateStore({ status: "error", error: errorMessage });
			})
			.finally(() => {
				fetchingRef.current = false;
			});
	}, [hasData, loadedAt, status, cacheKey, ttlMs, fetchFn, updateStore, errorMessage]);

	const refresh = useCallback(async () => {
		if (fetchingRef.current) return;
		storage.remove(cacheKey);
		fetchingRef.current = true;
		updateStore({ status: "loading", error: null });
		
		try {
			const data = await fetchFn();
			updateStore({ data, status: "success", loadedAt: Date.now(), error: null });
			storage.set(cacheKey, data, ttlMs / 1000);
		} catch (err) {
			updateStore({ status: "error", error: errorMessage });
		} finally {
			fetchingRef.current = false;
		}
	}, [cacheKey, ttlMs, fetchFn, updateStore, errorMessage]);

	return { refresh };
}
