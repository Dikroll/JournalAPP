import { useEffect } from "react";
import { getTodayString } from "@/shared/utils";
import { useEntityFetch } from "@/shared/hooks/useEntityFetch";
import { scheduleApi } from "../api";
import { SCHEDULE_CACHE_VERSION, useScheduleStore } from "../model/store";
import type { LessonItem } from "../model/types";

function isLoadedToday(timestamp: number): boolean {
	const loadedDate = new Date(timestamp);
	return (
		getTodayString() ===
		`${loadedDate.getFullYear()}-${String(loadedDate.getMonth() + 1).padStart(
			2,
			"0",
		)}-${String(loadedDate.getDate()).padStart(2, "0")}`
	);
}

export function resetScheduleTodayFetch() {
	// Let useEntityFetch handle cache resets if needed, or we just invalidate store
}

export function useScheduleToday() {
	const today = useScheduleStore((s) => s.today);
	const todayStatus = useScheduleStore((s) => s.todayStatus);
	const todayLoadedAt = useScheduleStore((s) => s.todayLoadedAt);
	const cacheVersion = useScheduleStore((s) => s.cacheVersion);
	const error = useScheduleStore((s) => s.error);
	
	const setToday = useScheduleStore((s) => s.setToday);
	const setTodayStatus = useScheduleStore((s) => s.setTodayStatus);
	const setTodayLoadedAt = useScheduleStore((s) => s.setTodayLoadedAt);
	const setError = useScheduleStore((s) => s.setError);
	const resetAllCache = useScheduleStore((s) => s.resetAllCache);

	const isTodayValid = todayLoadedAt !== null && isLoadedToday(todayLoadedAt);

	useEffect(() => {
		if (cacheVersion !== SCHEDULE_CACHE_VERSION || (todayLoadedAt !== null && !isTodayValid)) {
			resetAllCache();
		}
	}, [cacheVersion, isTodayValid, todayLoadedAt, resetAllCache]);

	useEntityFetch({
		cacheKey: "scheduleToday",
		loadedAt: isTodayValid ? todayLoadedAt : null,
		ttlMs: 24 * 60 * 60 * 1000, // It's validated by date, so 24h TTL is fine
		status: todayStatus,
		fetchFn: () => scheduleApi.getToday(),
		onStart: () => {
			setTodayStatus("loading");
			setError(null);
		},
		onSuccess: (data: LessonItem[]) => {
			setToday(data);
			setTodayLoadedAt(Date.now());
			setTodayStatus("success");
		},
		onError: (err) => {
			const msg =
				(err as { response?: { data?: { detail?: string } } })?.response?.data
					?.detail ?? "Ошибка загрузки расписания";
			setError(msg);
			if (today.length === 0) setTodayStatus("error");
		},
		onCacheHit: () => {
			if (todayStatus === "idle") setTodayStatus("success");
		},
	});

	return { today, status: todayStatus, error };
}
