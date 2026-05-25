import { useCallback } from "react";
import { useLibrary, useLibraryStore } from "@/entities/library";
import { useNetworkStore } from "@/shared/model/networkStore";

export function useRefreshLibrary() {
	const isOnline = useNetworkStore((s) => s.isOnline);
	const { status } = useLibraryStore();
	const { load } = useLibrary({
		autoLoad: false,
	});

	const refresh = useCallback(() => {
		if (!isOnline) return;
		load(true);
	}, [isOnline, load]);

	return {
		refresh,
		isRefreshing: status === "loading",
		isOnline,
	};
}
