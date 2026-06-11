import { useCallback } from "react";
import { useNetworkStore } from "../model/networkStore";

export function useNetworkRefresh(
	refreshAction: () => void,
	isRefreshing: boolean,
) {
	const isOnline = useNetworkStore((s) => s.isOnline);

	const refresh = useCallback(() => {
		if (!isOnline) return;
		refreshAction();
	}, [isOnline, refreshAction]);

	return { refresh, isRefreshing, isOnline };
}
