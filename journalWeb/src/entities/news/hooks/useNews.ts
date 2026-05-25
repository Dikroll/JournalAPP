import { useEffect, useRef } from "react";
import { ttl } from "@/shared/config";
import { CACHE_KEYS } from "@/shared/lib";
import { storage } from "@/shared/lib/encryptedStorage";
import { getIsOnline } from "@/shared/model/networkStore";
import { newsApi } from "../api";
import { useNewsStore } from "../model/store";
import type { NewsItem } from "../model/types";

export function useNews() {
	const { latest, status, error, loadedAt, update } = useNewsStore();
	const fetchingRef = useRef(false);

	useEffect(() => {
		if (fetchingRef.current) return;
		if (
			latest.length > 0 &&
			loadedAt &&
			Date.now() - loadedAt < ttl.ACTIVITY * 1000
		) {
			if (status === "idle") update({ status: "success" });
			return;
		}

		if (!getIsOnline()) {
			if (loadedAt !== null) {
				if (status === "idle") update({ status: "success" });
				return;
			}
			update({ status: "error", error: "Нет подключения к интернету" });
			return;
		}

		const cached = storage.get<NewsItem[]>(CACHE_KEYS.NEWS);
		if (cached) {
			update({
				latest: cached,
				status: "success",
				loadedAt: Date.now(),
				error: null,
			});
			return;
		}

		fetchingRef.current = true;
		update({ status: "loading", error: null });

		newsApi
			.getLatest()
			.then((data) => {
				update({
					latest: data,
					status: "success",
					loadedAt: Date.now(),
					error: null,
				});
				storage.set(CACHE_KEYS.NEWS, data, ttl.ACTIVITY);
			})
			.catch(() => {
				if (latest.length === 0) {
					update({ status: "error", error: "Не удалось загрузить новости" });
				}
			})
			.finally(() => {
				fetchingRef.current = false;
			});
	}, [latest.length, loadedAt, status, update]);

	const refresh = () => {
		if (fetchingRef.current) return;
		storage.remove(CACHE_KEYS.NEWS);
		fetchingRef.current = true;
		update({ status: "loading", error: null });

		newsApi
			.getLatest()
			.then((data) => {
				update({
					latest: data,
					status: "success",
					loadedAt: Date.now(),
					error: null,
				});
				storage.set(CACHE_KEYS.NEWS, data, ttl.ACTIVITY);
			})
			.catch(() =>
				update({ status: "error", error: "Не удалось загрузить новости" }),
			)
			.finally(() => {
				fetchingRef.current = false;
			});
	};

	return { latest, status, error, refresh };
}
