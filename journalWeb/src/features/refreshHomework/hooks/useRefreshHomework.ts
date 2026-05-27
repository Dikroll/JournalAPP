import { useHomework } from "@/entities/homework";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshHomework() {
	const { refresh: doRefresh, status } = useHomework();
	return useNetworkRefresh(doRefresh, status === "loading");
}
