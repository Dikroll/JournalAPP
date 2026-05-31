import { useEffect, useRef } from "react";
import { isCacheValid } from "../lib/isCacheValid";
import { getIsOnline } from "../model/networkStore";

interface UseEntityFetchOptions<T> {
	cacheKey: string;
	/** Уже загруженные данные — если есть и кеш валиден, запрос не делается */
	loadedAt: number | null;
	/** TTL в миллисекундах */
	ttlMs: number;
	/** Статус загрузки — пропускаем если уже идёт */
	status: string;
	/** Есть ли данные — для SWR: если true, показываем их пока идёт фоновый запрос */
	hasData?: boolean;
	/** Функция загрузки — должна вернуть Promise */
	fetchFn: () => Promise<T>;
	/** Коллбек при успехе */
	onSuccess: (data: T) => void;
	/** Коллбек при ошибке — опционально */
	onError?: (err: unknown) => void;
	/** Вызывается при начале загрузки */
	onStart?: () => void;
	/** Вызывается когда данные есть из кеша/persist и fetch не нужен (нормализация статуса) */
	onCacheHit?: () => void;
}

const fetchingPromises = new Map<string, Promise<any>>();

/** Clear all in-flight dedup entries. Call on logout / account switch. */
export function resetEntityFetch() {
	fetchingPromises.clear();
}

/**
 * Универсальный хук для загрузки данных с SWR (stale-while-revalidate).
 *
 * - Если есть кешированные данные — показываем сразу
 * - Всегда идём на API за свежими данными (если TTL истёк)
 * - Пока фоновый запрос летит, пользователь видит старые данные
 * - Спиннер "loading" показывается только когда данных вообще нет
 *
 * Offline-aware: если нет сети и есть кешированные данные — показываем стэйл.
 * Если нет сети и данных нет — вызываем onError.
 */
export function useEntityFetch<T>({
	cacheKey,
	loadedAt,
	ttlMs,
	status,
	hasData = loadedAt !== null,
	fetchFn,
	onSuccess,
	onError,
	onStart,
	onCacheHit,
}: UseEntityFetchOptions<T>) {
	const fetchFnRef = useRef(fetchFn);
	const onSuccessRef = useRef(onSuccess);
	const onErrorRef = useRef(onError);
	const onStartRef = useRef(onStart);
	const onCacheHitRef = useRef(onCacheHit);

	fetchFnRef.current = fetchFn;
	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;
	onStartRef.current = onStart;
	onCacheHitRef.current = onCacheHit;

	useEffect(() => {
		if (fetchingPromises.has(cacheKey)) {
			// Already fetching — just normalize status if needed
			if (hasData && status === "idle") onCacheHitRef.current?.();
			return;
		}
		if (status === "loading") return;

		// SWR: if we have data, show it right away
		if (hasData && status === "idle") {
			onCacheHitRef.current?.();
		}

		// If cache is still fresh, skip the revalidation
		if (hasData && isCacheValid(loadedAt, ttlMs)) {
			return;
		}

		if (!getIsOnline()) {
			if (loadedAt !== null) {
				if (status === "idle") onCacheHitRef.current?.();
				return;
			}
			onErrorRef.current?.(new Error("Нет подключения к интернету"));
			return;
		}

		// Only show loading state if there's no data at all
		if (!hasData) {
			onStartRef.current?.();
		}

		// Always revalidate from API
		const promise = fetchFnRef.current()
			.then((data) => {
				onSuccessRef.current(data);
			})
			.catch((err) => {
				// Only propagate error if there's no stale data to show
				if (!hasData) {
					onErrorRef.current?.(err);
				}
			})
			.finally(() => {
				fetchingPromises.delete(cacheKey);
			});

		fetchingPromises.set(cacheKey, promise);
	}, [cacheKey, loadedAt, status, ttlMs, hasData]);
}
