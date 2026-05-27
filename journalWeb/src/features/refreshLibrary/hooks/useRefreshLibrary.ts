import { useCallback } from "react";
import { useLibrary, useLibraryStore } from "@/entities/library";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshLibrary() {
	const { status } = useLibraryStore();
	const { load } = useLibrary({ autoLoad: false });

	const refreshAction = useCallback(() => {
		load(true);
	}, [load]);

	return useNetworkRefresh(refreshAction, status === "loading");
}
