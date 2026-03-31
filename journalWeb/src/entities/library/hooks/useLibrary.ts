import { isCacheValid } from '@/shared/lib'
import axios from 'axios'
import { useCallback, useEffect, useRef } from 'react'
import { libraryApi } from '../api'
import { useLibraryStore } from '../model/store'

const CACHE_TTL_MS = 30 * 60 * 1000 // 30 mins

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
		materials,
		counters,
		status,
		error,
		setMaterials,
		setCounters,
		setStatus,
		setError,
		setSelectedSpec,
		setSelectedMaterialType,
	} = useLibraryStore()

	const loadedAtRef = useRef<Record<string, number>>({})
	const isLoadingRef = useRef(false)

	const cacheKey = `${specId ?? 'all'}-${materialType ?? 'all'}`

	const load = useCallback(
		async (force = false) => {
			if (isLoadingRef.current) return

			if (!force && isCacheValid(loadedAtRef.current[cacheKey], CACHE_TTL_MS))
				return

			isLoadingRef.current = true
			setStatus('loading')
			setError(null)

			try {
				const [materials, counters] = await Promise.all([
					libraryApi.getMaterials(specId, materialType),
					libraryApi.getCounters(specId, materialType),
				])

				setMaterials(materials)
				setCounters(counters)
				setStatus('success')
				loadedAtRef.current[cacheKey] = Date.now()

				if (specId != null) {
					setSelectedSpec(specId)
				}
				setSelectedMaterialType(materialType ?? null)
			} catch (err) {
				if (axios.isAxiosError(err) && err.response?.status === 422) {
					try {
						const [materials, counters] = await Promise.all([
							libraryApi.getAllMaterials(),
							libraryApi.getCounters(),
						])
						setMaterials(materials)
						setCounters(counters)
						setStatus('success')
						loadedAtRef.current[cacheKey] = Date.now()
						setSelectedSpec(null)
						setSelectedMaterialType(null)
						return
					} catch (nestedErr) {
						const nestedMessage =
							nestedErr instanceof Error
								? nestedErr.message
								: 'Failed to load library materials after 422 fallback'
						setError(nestedMessage)
						setStatus('error')
						return
					}
				}

				const message =
					err instanceof Error
						? err.message
						: 'Failed to load library materials'
				setError(message)
				setStatus('error')
			} finally {
				isLoadingRef.current = false
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[cacheKey, specId, materialType],
	)

	// Отслеживаем изменение materialType и specId через ref,
	// чтобы при переключении вкладок всегда загружать свежие данные.
	// Проблема: store общий — если вернуться на вкладку 1 после вкладки 2,
	// store содержит данные вкладки 2, а loadedAtRef считает кеш валидным.
	// Решение: force=true при смене ключа.
	const prevCacheKeyRef = useRef<string | null>(null)

	useEffect(() => {
		if (!autoLoad) return

		const isKeyChange =
			prevCacheKeyRef.current !== null && prevCacheKeyRef.current !== cacheKey

		prevCacheKeyRef.current = cacheKey

		// При смене вкладки или предмета — принудительная перезагрузка,
		// иначе store мог быть перезаписан другой вкладкой.
		load(isKeyChange)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoLoad, cacheKey])

	return {
		materials,
		counters,
		status,
		error,
		isLoading: status === 'loading',
		load,
	}
}

export function useLibraryByType(type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) {
	const { materials } = useLibraryStore()
	return materials.filter(m => m.material_type === type)
}
