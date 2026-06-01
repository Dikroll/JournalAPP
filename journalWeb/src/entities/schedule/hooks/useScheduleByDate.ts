import { ttl } from "@/shared/config";
import { useEntityFetch } from "@/shared/hooks/useEntityFetch";
import { scheduleApi } from "../api";
import { useScheduleStore } from "../model/store";
import type { LessonItem } from "../model/types";

const CACHE_TTL_MS = ttl.SCHEDULE * 1000;
const EMPTY_LESSONS: LessonItem[] = [];

export function useScheduleByDate(date: string | null) {
	const lessons = useScheduleStore((s) =>
		date ? (s.days[date] ?? EMPTY_LESSONS) : EMPTY_LESSONS,
	);
	const status = useScheduleStore((s) =>
		date ? (s.dayStatus[date] ?? "idle") : "idle",
	);
	const dayLoadedAt = useScheduleStore((s) =>
		date ? (s.dayLoadedAt[date] ?? null) : null,
	);
	const setDay = useScheduleStore((s) => s.setDay);
	const setDayStatus = useScheduleStore((s) => s.setDayStatus);
	const setDayLoadedAt = useScheduleStore((s) => s.setDayLoadedAt);

	useEntityFetch({
		cacheKey: date ? `scheduleByDate-${date}` : "scheduleByDate-empty",
		loadedAt: dayLoadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		// If date is null, we don't fetch, we just return empty
		fetchFn: () => (date ? scheduleApi.getByDate(date) : Promise.resolve([])),
		onStart: () => {
			if (date) setDayStatus(date, "loading");
		},
		onSuccess: (data) => {
			if (date) {
				setDay(date, data);
				setDayLoadedAt(date, Date.now());
				setDayStatus(date, "success");
			}
		},
		onError: () => {
			if (date && lessons.length === 0) setDayStatus(date, "error");
		},
		onCacheHit: () => {
			if (date && status === "idle") setDayStatus(date, "success");
		},
		// Early return condition handled by skipping the request if no date
	});

	// If no date is provided, we still need to keep the hook call valid, 
	// so the cacheKey changes, but fetchFn just resolves empty immediately.
	// However, useEntityFetch is robust enough to handle it cleanly.
	return { lessons, status };
}
