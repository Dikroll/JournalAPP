import { useCallback } from "react";
import { useLibrary, useLibraryStore } from "@/entities/library";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshLibrary() {
	const { status } = useLibraryStore();
	const selectedSpecId = useLibraryStore((state) => state.selectedSpecId);
	const selectedMaterialType = useLibraryStore(
		(state) => state.selectedMaterialType,
	);
	const { load } = useLibrary({
		specId: selectedSpecId ?? undefined,
		materialType: selectedMaterialType ?? undefined,
		autoLoad: false,
	});

	const refreshAction = useCallback(() => {
		load(true);
	}, [load]);

	return useNetworkRefresh(refreshAction, status === "loading");
}
