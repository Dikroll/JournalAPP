import { useCallback } from "react";
import { useGrades } from "@/entities/grades";
import { useNetworkStore } from "@/shared/model/networkStore";

export function useRefreshGrades() {
	const isOnline = useNetworkStore((s) => s.isOnline);
	const { refresh: doRefresh, status } = useGrades();

	const refresh = useCallback(() => {
		if (!isOnline) return;
		doRefresh();
	}, [isOnline, doRefresh]);

	return {
		refresh,
		isRefreshing: status === "loading",
		isOnline,
	};
}
