import { useCallback } from "react";
import { useScheduleStore } from "@/entities/schedule";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshSchedule() {
	const clearMonthsCache = useScheduleStore((s) => s.clearMonthsCache);
	const clearWeeksCache = useScheduleStore((s) => s.clearWeeksCache);
	const monthStatus = useScheduleStore((s) => s.monthStatus);
	const weekStatus = useScheduleStore((s) => s.weekStatus);

	const isRefreshing =
		Object.values(monthStatus).some((s) => s === "loading") ||
		Object.values(weekStatus).some((s) => s === "loading");

	const refreshAction = useCallback(() => {
		clearMonthsCache();
		clearWeeksCache();
	}, [clearMonthsCache, clearWeeksCache]);

	return useNetworkRefresh(refreshAction, isRefreshing);
}

