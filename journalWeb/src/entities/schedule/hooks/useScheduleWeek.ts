import { useEffect, useRef } from "react";
import { ttl } from "@/shared/config";
import { isCacheValid } from "@/shared/lib";
import { useAuthStore } from "@/shared/model/authStore";
import { getIsOnline } from "@/shared/model/networkStore";
import { scheduleApi } from "../api";
import { useScheduleStore } from "../model/store";
import type { LessonItem } from "../model/types";

const CACHE_TTL_MS = ttl.SCHEDULE * 1000;
const ERROR_STATE_DELAY_MS = 600;

const EMPTY_LESSONS: LessonItem[] = [];

function isRequestCurrent(username: string | null) {
	return useAuthStore.getState().activeUsername === username;
}

export function useScheduleWeek(date: string) {
	const lessons = useScheduleStore((s) => s.weeks[date] ?? EMPTY_LESSONS);
	const status = useScheduleStore((s) => s.weekStatus[date] ?? "idle");
	const weekLoadedAt = useScheduleStore((s) => s.weekLoadedAt[date] ?? null);
	const setWeek = useScheduleStore((s) => s.setWeek);
	const setWeekStatus = useScheduleStore((s) => s.setWeekStatus);
	const setWeekLoadedAt = useScheduleStore((s) => s.setWeekLoadedAt);

	const fetchingRef = useRef(false);

	useEffect(() => {
		if (!date) return;
		if (fetchingRef.current) return;
		if (isCacheValid(weekLoadedAt, CACHE_TTL_MS)) {
			if (status === "idle") setWeekStatus(date, "success");
			return;
		}

		if (!getIsOnline()) {
			if (weekLoadedAt !== null) {
				if (status === "idle") setWeekStatus(date, "success");
				return;
			}
			const username = useAuthStore.getState().activeUsername;
			setTimeout(() => {
				if (!isRequestCurrent(username)) return;
				setWeekStatus(date, "error");
			}, ERROR_STATE_DELAY_MS);
			return;
		}

		fetchingRef.current = true;
		const username = useAuthStore.getState().activeUsername;
		setWeekStatus(date, "loading");

		scheduleApi
			.getWeek(date)
			.then((data) => {
				if (!isRequestCurrent(username)) return;
				setWeek(date, data);
				setWeekLoadedAt(date, Date.now());
				setWeekStatus(date, "success");
			})
			.catch(() => {
				setTimeout(() => {
					if (!isRequestCurrent(username)) return;
					if (lessons.length === 0) setWeekStatus(date, "error");
				}, ERROR_STATE_DELAY_MS);
			})
			.finally(() => {
				fetchingRef.current = false;
			});
	}, [
		date,
		weekLoadedAt,
		lessons.length,
		setWeek,
		setWeekLoadedAt,
		setWeekStatus,
		status,
	]);

	return { lessons, status };
}
