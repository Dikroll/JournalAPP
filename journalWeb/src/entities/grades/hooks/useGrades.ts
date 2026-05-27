import { ttl } from "@/shared/config";
import { CACHE_KEYS } from "@/shared/lib";
import { gradesApi } from "../api";
import { useZustandQuery } from "@/shared/hooks/useZustandQuery";
import { useGradesStore } from "../model/store";
import type { GradeEntry } from "../model/types";

export function resetGradesFetch() {}

export function useGrades() {
	const { entries, status, error, loadedAt, update } = useGradesStore();

	const { refresh } = useZustandQuery({
		cacheKey: CACHE_KEYS.GRADES_ALL,
		ttlMs: ttl.ACTIVITY * 1000,
		loadedAt,
		status,
		hasData: entries.length > 0,
		fetchFn: () => gradesApi.getAll(),
		updateStore: (state) => {
			if (state.data !== undefined) {
				update({ entries: state.data, status: state.status, loadedAt: state.loadedAt, error: state.error });
			} else {
				update({ status: state.status, error: state.error });
			}
		},
		errorMessage: "Не удалось загрузить оценки",
	});

	return { entries, status, error, refresh };
}
