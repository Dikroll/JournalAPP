import { useCallback, useState } from "react";
import { homeworkApi, useHomework } from "@/entities/homework";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshHomework() {
	const { refresh: doRefresh, status } = useHomework();
	const [isSyncing, setIsSyncing] = useState(false);
	const refresh = useCallback(async () => {
		if (isSyncing) return;

		setIsSyncing(true);
		try {
			await homeworkApi.refreshCache().catch(() => undefined);
			await doRefresh();
		} finally {
			setIsSyncing(false);
		}
	}, [doRefresh, isSyncing]);

	return useNetworkRefresh(refresh, isSyncing || status === "loading");
}
