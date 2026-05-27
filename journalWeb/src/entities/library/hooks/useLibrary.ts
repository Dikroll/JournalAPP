import axios from "axios";
import { useCallback, useEffect } from "react";
import { ttl } from "@/shared/config";
import { isCacheValid } from "@/shared/lib";
import { libraryApi } from "../api";
import { useLibraryStore } from "../model/store";

const MATERIALS_TTL_MS = ttl.SESSION * 1000; // 24h
const COUNTERS_TTL_MS = ttl.SESSION * 1000; // 24h
const fetchingMaterials = new Set<string>();
const fetchingCounters = new Set<string>();

interface UseLibraryOptions {
	specId?: number;
	materialType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
	autoLoad?: boolean;
}

export function useLibrary({
	specId,
	materialType,
	autoLoad = true,
}: UseLibraryOptions = {}) {
	const {
		materialsMap,
		countersMap,

		loadingKeys,
		errorKeys,
		setMaterials,
		setMaterialsLoadedAt,
		setCounters,
		setCountersLoadedAt,
		setLoading,
		setError,
		setStatus,
		setGlobalError,
		setSelectedSpec,
		setSelectedMaterialType,
	} = useLibraryStore();

	/** Ключ для материалов — зависит от предмета И типа */
	const materialsKey = `${specId ?? "all"}-${materialType ?? "all"}`;
	/** Ключ для счётчиков — только предмет, один на все вкладки */
	const countersKey = `${specId ?? "all"}`;

	const materials = materialsMap[materialsKey] ?? [];
	const counters = countersMap[countersKey] ?? null;
	const isLoading = loadingKeys.has(materialsKey);
	const error = errorKeys[materialsKey] ?? null;

	/** Загрузка материалов для конкретной вкладки */
	const loadMaterials = useCallback(
		async (force = false) => {
			if (fetchingMaterials.has(materialsKey)) return;
			const loadedAt =
				useLibraryStore.getState().materialsLoadedAt[materialsKey] ?? null;
			if (!force && isCacheValid(loadedAt, MATERIALS_TTL_MS)) return;

			fetchingMaterials.add(materialsKey);
			setLoading(materialsKey, true);
			setStatus("loading");
			setError(materialsKey, null);
			setGlobalError(null);

			try {
				const mats = await libraryApi.getMaterials(specId, materialType);
				setMaterials(materialsKey, mats);
				setMaterialsLoadedAt(materialsKey, Date.now());
				setSelectedSpec(specId ?? null);
				setSelectedMaterialType(materialType ?? null);
				setStatus("success");
			} catch (err) {
				if (axios.isAxiosError(err) && err.response?.status === 422) {
					try {
						const mats = await libraryApi.getAllMaterials();
						setMaterials("all-all", mats);
						setMaterialsLoadedAt("all-all", Date.now());
						setSelectedSpec(null);
						setSelectedMaterialType(null);
						setStatus("success");
						return;
					} catch (nestedErr) {
						const msg =
							nestedErr instanceof Error
								? nestedErr.message
								: "Ошибка загрузки";
						setError(materialsKey, msg);
						setGlobalError(msg);
						setStatus("error");
						return;
					}
				}
				const msg =
					err instanceof Error ? err.message : "Ошибка загрузки материалов";
				setError(materialsKey, msg);
				setGlobalError(msg);
				setStatus("error");
			} finally {
				fetchingMaterials.delete(materialsKey);
				setLoading(materialsKey, false);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			materialsKey,
			specId,
			materialType,
			setError,
			setGlobalError,
			setLoading,
			setMaterials,
			setMaterialsLoadedAt,
			setSelectedMaterialType,
			setSelectedSpec,
			setStatus,
		],
	);

	/** Загрузка счётчиков — один раз на предмет, независимо от активной вкладки */
	const loadCounters = useCallback(
		async (force = false) => {
			if (fetchingCounters.has(countersKey)) return;
			const loadedAt =
				useLibraryStore.getState().countersLoadedAt[countersKey] ?? null;
			if (!force && isCacheValid(loadedAt, COUNTERS_TTL_MS)) return;

			fetchingCounters.add(countersKey);
			try {
				const cts = await libraryApi.getCounters(specId);
				setCounters(countersKey, cts);
				setCountersLoadedAt(countersKey, Date.now());
			} catch {
				// счётчики некритичны — молча игнорируем ошибку
			} finally {
				fetchingCounters.delete(countersKey);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[countersKey, specId, setCounters, setCountersLoadedAt],
	);

	useEffect(() => {
		if (!autoLoad) return;
		loadMaterials(false);
	}, [autoLoad, loadMaterials]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!autoLoad) return;
		loadCounters(false);
	}, [autoLoad, loadCounters]); // eslint-disable-line react-hooks/exhaustive-deps

	const load = useCallback(
		(force = false) => {
			void Promise.all([loadMaterials(force), loadCounters(force)]);
		},
		[loadMaterials, loadCounters],
	);

	return { materials, counters, isLoading, error, load };
}

export function useLibraryByType(type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) {
	const { materialsMap } = useLibraryStore();
	return Object.values(materialsMap)
		.flat()
		.filter((m) => m.material_type === type);
}
