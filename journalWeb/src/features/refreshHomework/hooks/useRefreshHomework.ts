import { useCallback, useRef, useState } from "react";
import { homeworkApi, useHomework } from "@/entities/homework";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshHomework() {
	const { refresh: doRefresh, status } = useHomework();
	const [isSyncing, setIsSyncing] = useState(false);
	// Use a ref to avoid stale closure — isSyncing in deps of useCallback
	// was causing a new function identity on every state change, and the
	// closure could read a stale value.
	const syncingRef = useRef(false);

	const refresh = useCallback(async () => {
		if (syncingRef.current) return;

		syncingRef.current = true;
		setIsSyncing(true);
		try {
			await homeworkApi.refreshCache().catch((err) => {
				console.warn("[refreshHomework] refreshCache failed:", err);
			});
			await doRefresh();
		} finally {
			syncingRef.current = false;
			setIsSyncing(false);
		}
	}, [doRefresh]);

	return useNetworkRefresh(refresh, isSyncing || status === "loading");
}
