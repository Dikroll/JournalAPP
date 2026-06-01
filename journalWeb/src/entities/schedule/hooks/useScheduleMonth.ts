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

export function useScheduleMonth(date: string) {
	const lessons = useScheduleStore((s) => s.months[date] ?? EMPTY_LESSONS);
	const status = useScheduleStore((s) => s.monthStatus[date] ?? "idle");
	const monthLoadedAt = useScheduleStore((s) => s.monthLoadedAt[date] ?? null);
	const setMonth = useScheduleStore((s) => s.setMonth);
	const setMonthStatus = useScheduleStore((s) => s.setMonthStatus);
	const setMonthLoadedAt = useScheduleStore((s) => s.setMonthLoadedAt);

	const fetchingRef = useRef(false);

	useEffect(() => {
		if (!date) return;
		if (fetchingRef.current) return;
		if (isCacheValid(monthLoadedAt, CACHE_TTL_MS)) {
			if (status === "idle") setMonthStatus(date, "success");
			return;
		}

		if (!getIsOnline()) {
			if (monthLoadedAt !== null) {
				if (status === "idle") setMonthStatus(date, "success");
				return;
			}
			const username = useAuthStore.getState().activeUsername;
			setTimeout(() => {
				if (!isRequestCurrent(username)) return;
				setMonthStatus(date, "error");
			}, ERROR_STATE_DELAY_MS);
			return;
		}

		fetchingRef.current = true;
		const username = useAuthStore.getState().activeUsername;
		setMonthStatus(date, "loading");

		scheduleApi
			.getMonth(date)
			.then((data) => {
				if (!isRequestCurrent(username)) return;
				setMonth(date, data);
				setMonthLoadedAt(date, Date.now());
				setMonthStatus(date, "success");
			})
			.catch(() => {
				setTimeout(() => {
					if (!isRequestCurrent(username)) return;
					if (lessons.length === 0) setMonthStatus(date, "error");
				}, ERROR_STATE_DELAY_MS);
			})
			.finally(() => {
				fetchingRef.current = false;
			});
	}, [
		date,
		monthLoadedAt,
		lessons.length,
		setMonth,
		setMonthLoadedAt,
		setMonthStatus,
		status,
	]);

	return { lessons, status };
}
