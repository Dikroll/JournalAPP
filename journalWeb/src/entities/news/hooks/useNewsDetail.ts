import { useEffect, useRef, useState } from "react";
import { ttl } from "@/shared/config";
import { CACHE_KEYS } from "@/shared/lib";
import { storage } from "@/shared/lib/encryptedStorage";
import { getIsOnline } from "@/shared/model/networkStore";
import { newsApi } from "../api";
import { useNewsStore } from "../model/store";
import type { NewsDetail } from "../model/types";

export function useNewsDetail(id: number) {
	const detail = useNewsStore((s) => s.details[id]);
	const setDetail = useNewsStore((s) => s.setDetail);
	const markAsRead = useNewsStore((s) => s.markAsRead);

	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>(detail ? "success" : "idle");
	const [error, setError] = useState<string | null>(null);
	const fetchingRef = useRef(false);

	useEffect(() => {
		if (fetchingRef.current) return;
		if (detail) {
			if (!detail.is_read) {
				markAsRead(id);
			}
			return;
		}

		if (!getIsOnline()) {
			setStatus("error");
			setError("Нет подключения к интернету");
			return;
		}

		const cacheKey = CACHE_KEYS.NEWS_DETAIL(id);
		const cached = storage.get<NewsDetail>(cacheKey);
		if (cached) {
			setDetail(id, cached);
			setStatus("success");
			if (!cached.is_read) markAsRead(id);
			return;
		}

		fetchingRef.current = true;
		setStatus("loading");

		newsApi
			.getDetail(id)
			.then((data) => {
				setDetail(id, data);
				setStatus("success");
				setError(null);
				storage.set(cacheKey, data, ttl.ACTIVITY * 2); // Cache detail longer
				if (!data.is_read) markAsRead(id);
			})
			.catch(() => {
				setStatus("error");
				setError("Не удалось загрузить новость");
			})
			.finally(() => {
				fetchingRef.current = false;
			});
	}, [id, detail, setDetail, markAsRead]);

	return { detail, status, error };
}
