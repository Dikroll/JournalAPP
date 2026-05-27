import { useEffect, useRef } from "react";
import { ttl } from "@/shared/config";
import { isCacheValid } from "@/shared/lib";
import { dashboardApi } from "../api";
import { useDashboardChartsStore } from "../model/store";

export { calcTrend, lastValue, toChartData } from "../utils/chartUtils";

const CACHE_TTL_MS = ttl.ACTIVITY * 1000;
const FETCH_TIMEOUT_MS = 15_000;

interface UseDashboardChartsOptions {
	enabled?: boolean;
}

export function useDashboardCharts({
	enabled = true,
}: UseDashboardChartsOptions = {}) {
	const {
		progress,
		attendance,
		status,
		loadedAt,
		setProgress,
		setAttendance,
		setStatus,
		setLoadedAt,
	} = useDashboardChartsStore();

	const fetchingRef = useRef(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!enabled) return;
		if (fetchingRef.current) return;
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return;

		fetchingRef.current = true;
		setStatus("loading");

		timeoutRef.current = setTimeout(() => {
			if (fetchingRef.current) {
				fetchingRef.current = false;
				setStatus("error");
			}
		}, FETCH_TIMEOUT_MS);

		Promise.all([
			dashboardApi.getProgressChart(),
			dashboardApi.getAttendanceChart(),
		])
			.then(([progress, attendance]) => {
				setProgress(progress);
				setAttendance(attendance);
				setLoadedAt(Date.now());
				setStatus("success");
			})
			.catch(() => {
				setStatus("error");
			})
			.finally(() => {
				fetchingRef.current = false;
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}
			});
	}, [enabled, loadedAt, setAttendance, setLoadedAt, setProgress, setStatus]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return { progress, attendance, status };
}
