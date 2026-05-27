import { useGrades } from "@/entities/grades";
import { useNetworkRefresh } from "@/shared/hooks/useNetworkRefresh";

export function useRefreshGrades() {
	const { refresh: doRefresh, status } = useGrades();
	return useNetworkRefresh(doRefresh, status === "loading");
}
