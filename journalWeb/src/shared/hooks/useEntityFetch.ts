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

/**
 * Универсальный хук для загрузки данных с кешированием.
 * Заменяет повторяющийся паттерн fetchingRef + isCacheValid + setStatus
 * в useFutureExams, useExamResults, usePayment, useReviews, useSubjects и др.
 *
 * Offline-aware: если нет сети и есть кешированные данные — показываем стэйл.
 * Если нет сети и данных нет — вызываем onError.
 */
export function useEntityFetch<T>({
	cacheKey,
	loadedAt,
	ttlMs,
	status,
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
			// Already fetching elsewhere
			return;
		}
		if (status === "loading") return;

		if (isCacheValid(loadedAt, ttlMs)) {
			if (status === "idle") onCacheHitRef.current?.();
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

		onStartRef.current?.();

		const promise = fetchFnRef.current()
			.then((data) => {
				onSuccessRef.current(data);
			})
			.catch((err) => {
				onErrorRef.current?.(err);
			})
			.finally(() => {
				fetchingPromises.delete(cacheKey);
			});

		fetchingPromises.set(cacheKey, promise);
	}, [cacheKey, loadedAt, status, ttlMs]); // Using stable refs and cacheKey
}

