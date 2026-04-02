import { isCacheValid } from '@/shared/lib'
import axios from 'axios'
import { useCallback, useEffect, useRef } from 'react'
import { libraryApi } from '../api'
import { useLibraryStore } from '../model/store'

const MATERIALS_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const COUNTERS_TTL_MS = 24 * 60 * 60 * 1000 // 24h

interface UseLibraryOptions {
	specId?: number
	materialType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
	autoLoad?: boolean
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
		setSelectedSpec,
		setSelectedMaterialType,
	} = useLibraryStore()

	/** Ключ для материалов — зависит от предмета И типа */
	const materialsKey = `${specId ?? 'all'}-${materialType ?? 'all'}`
	/** Ключ для счётчиков — только предмет, один на все вкладки */
	const countersKey = `${specId ?? 'all'}`

	const fetchingMaterialsRef = useRef(false)
	const fetchingCountersRef = useRef(false)

	const materials = materialsMap[materialsKey] ?? []
	const counters = countersMap[countersKey] ?? null
	const isLoading = loadingKeys.has(materialsKey)
	const error = errorKeys[materialsKey] ?? null

	/** Загрузка материалов для конкретной вкладки */
	const loadMaterials = useCallback(
		async (force = false) => {
			if (fetchingMaterialsRef.current) return
			const loadedAt =
				useLibraryStore.getState().materialsLoadedAt[materialsKey] ?? null
			if (!force && isCacheValid(loadedAt, MATERIALS_TTL_MS)) return

			fetchingMaterialsRef.current = true
			setLoading(materialsKey, true)
			setError(materialsKey, null)

			try {
				const mats = await libraryApi.getMaterials(specId, materialType)
				setMaterials(materialsKey, mats)
				setMaterialsLoadedAt(materialsKey, Date.now())
				setSelectedSpec(specId ?? null)
				setSelectedMaterialType(materialType ?? null)
			} catch (err) {
				if (axios.isAxiosError(err) && err.response?.status === 422) {
					try {
						const mats = await libraryApi.getAllMaterials()
						setMaterials('all-all', mats)
						setMaterialsLoadedAt('all-all', Date.now())
						setSelectedSpec(null)
						setSelectedMaterialType(null)
						return
					} catch (nestedErr) {
						setError(
							materialsKey,
							nestedErr instanceof Error
								? nestedErr.message
								: 'Ошибка загрузки',
						)
						return
					}
				}
				setError(
					materialsKey,
					err instanceof Error ? err.message : 'Ошибка загрузки материалов',
				)
			} finally {
				fetchingMaterialsRef.current = false
				setLoading(materialsKey, false)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[materialsKey, specId, materialType],
	)

	/** Загрузка счётчиков — один раз на предмет, независимо от активной вкладки */
	const loadCounters = useCallback(
		async (force = false) => {
			if (fetchingCountersRef.current) return
			const loadedAt =
				useLibraryStore.getState().countersLoadedAt[countersKey] ?? null
			if (!force && isCacheValid(loadedAt, COUNTERS_TTL_MS)) return

			fetchingCountersRef.current = true
			try {
				const cts = await libraryApi.getCounters(specId)
				setCounters(countersKey, cts)
				setCountersLoadedAt(countersKey, Date.now())
			} catch {
				// счётчики некритичны — молча игнорируем ошибку
			} finally {
				fetchingCountersRef.current = false
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[countersKey, specId],
	)

	useEffect(() => {
		if (!autoLoad) return
		loadMaterials(false)
	}, [autoLoad, materialsKey]) // eslint-disable-line react-hooks/exhaustive-deps

	// Счётчики грузятся один раз при смене предмета — не при смене вкладки
	useEffect(() => {
		if (!autoLoad) return
		loadCounters(false)
	}, [autoLoad, countersKey]) // eslint-disable-line react-hooks/exhaustive-deps

	const load = useCallback(
		(force = false) => {
			loadMaterials(force)
			loadCounters(force)
		},
		[loadMaterials, loadCounters],
	)

	return { materials, counters, isLoading, error, load }
}

export function useLibraryByType(type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) {
	const { materialsMap } = useLibraryStore()
	return Object.values(materialsMap)
		.flat()
		.filter(m => m.material_type === type)
}
