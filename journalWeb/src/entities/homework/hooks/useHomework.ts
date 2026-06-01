import { useCallback, useEffect } from "react";
import { useUserStore } from "@/entities/user";
import { timing, ttl } from "@/shared/config";
import { isCacheValid, preloadImages } from "@/shared/lib";
import { useAuthStore } from "@/shared/model/authStore";
import { getIsOnline } from "@/shared/model/networkStore";
import { homeworkApi } from "../api";
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from "../model/store";

const CACHE_TTL_MS = ttl.ACTIVITY * 1000;
const ERROR_STATE_DELAY_MS = 600;

const loadingAllByGroup = new Map<number, Promise<void>>();
const loadingMoreByKey = new Map<string, Promise<void>>();
let fetchGeneration = 0;

function isRequestCurrent(generation: number, username: string | null) {
	return (
		generation === fetchGeneration &&
		useAuthStore.getState().activeUsername === username
	);
}

/** Clears in-flight request dedup maps. Call on logout / account switch. */
export function resetHomeworkFetch() {
	fetchGeneration += 1;
	loadingAllByGroup.clear();
	loadingMoreByKey.clear();
}

async function runLoadAll(groupId: number, force: boolean) {
	// When force=true (manual refresh), skip dedup so we always hit the API.
	// When force=false (auto-refresh / mount), deduplicate concurrent requests.
	if (!force && loadingAllByGroup.has(groupId)) {
		await loadingAllByGroup.get(groupId);
		return;
	}

	const store = useHomeworkStore.getState();
	const { loadedAt, status: currentStatus } = store;

	const hasData = loadedAt !== null;

	// SWR: if we have data, show it immediately
	if (hasData && currentStatus === "idle") store.setStatus("success");

	// If cache is fresh AND not forced, skip the API call
	if (!force && isCacheValid(loadedAt, CACHE_TTL_MS)) {
		return;
	}

	if (!getIsOnline()) {
		if (hasData) {
			if (currentStatus === "idle") store.setStatus("success");
			return;
		}
		const generation = fetchGeneration;
		const username = useAuthStore.getState().activeUsername;
		setTimeout(() => {
			if (!isRequestCurrent(generation, username)) return;
			store.setError("Нет подключения к интернету");
			store.setStatus("error");
		}, ERROR_STATE_DELAY_MS);
		return;
	}

	// Only show loading spinner when there's no data at all
	if (!hasData) {
		store.setStatus("loading");
	}
	store.setError(null);

	const generation = fetchGeneration;
	const username = useAuthStore.getState().activeUsername;
	const promise = (async () => {
		try {
			const { counters, items } = await homeworkApi.getAll(groupId);
			if (!isRequestCurrent(generation, username)) return;
			const latest = useHomeworkStore.getState();
			latest.setCounters(counters);

			const specsMap = new Map<number, string>();
			const photoUrls: string[] = [];

			Object.values(items)
				.flat()
				.forEach((hw) => {
					if (hw.spec_id != null && hw.spec_name) {
						specsMap.set(hw.spec_id, hw.spec_name);
					}
					if (hw.photo_url) photoUrls.push(hw.photo_url);
				});

			latest.setKnownSpecs(
				Array.from(specsMap.entries())
					.map(([specId, specName]) => ({ specId, specName }))
					.sort((a, b) => a.specName.localeCompare(b.specName, "ru")),
			);

			Object.entries(items).forEach(([statusKey, list]) => {
				latest.setItems(Number(statusKey), list);
			});

			latest.setLoadedAt(Date.now());
			latest.setStatus("success");

			if (photoUrls.length > 0) preloadImages(photoUrls);
		} catch {
			setTimeout(() => {
				if (!isRequestCurrent(generation, username)) return;
				const latest = useHomeworkStore.getState();
				latest.setError("Не удалось загрузить домашние задания");
				if (latest.loadedAt === null) latest.setStatus("error");
			}, ERROR_STATE_DELAY_MS);
		} finally {
			loadingAllByGroup.delete(groupId);
		}
	})();

	loadingAllByGroup.set(groupId, promise);
	await promise;
}

async function runLoadMore(groupId: number, statusKey: number) {
	const mapKey = `${groupId}-${statusKey}`;
	if (loadingMoreByKey.has(mapKey)) return loadingMoreByKey.get(mapKey);

	const generation = fetchGeneration;
	const username = useAuthStore.getState().activeUsername;
	const promise = (async () => {
		try {
			const store = useHomeworkStore.getState();
			const currentPage = store.pages[statusKey] ?? 1;
			const nextPage = currentPage + 1;
			const newItems = await homeworkApi.getByStatus(
				statusKey,
				groupId,
				nextPage,
			);
			if (!isRequestCurrent(generation, username)) return;
			store.appendItems(statusKey, newItems, nextPage);

			const newPhotos = newItems
				.map((hw) => hw.photo_url)
				.filter((u): u is string => !!u);
			if (newPhotos.length > 0) preloadImages(newPhotos);

			if (newItems.length < PAGE_SIZE) {
				store.setExpanded(statusKey, true);
			}
		} catch {
		} finally {
			loadingMoreByKey.delete(mapKey);
		}
	})();

	loadingMoreByKey.set(mapKey, promise);
	return promise;
}

export function useHomework() {
	const groupId = useUserStore((s) => s.user?.group?.id);

	const items = useHomeworkStore((s) => s.items);
	const expandedStatuses = useHomeworkStore((s) => s.expandedStatuses);
	const counters = useHomeworkStore((s) => s.counters);
	const status = useHomeworkStore((s) => s.status);
	const error = useHomeworkStore((s) => s.error);
	const filterStatus = useHomeworkStore((s) => s.filterStatus);
	const loadedAt = useHomeworkStore((s) => s.loadedAt);
	const setFilter = useHomeworkStore((s) => s.setFilter);

	const loadAll = useCallback(
		(force = false) => {
			if (!groupId) return Promise.resolve();
			return runLoadAll(groupId, force);
		},
		[groupId],
	);

	const loadMore = useCallback(
		(statusKey: number) => {
			if (!groupId) return Promise.resolve();
			return runLoadMore(groupId, statusKey);
		},
		[groupId],
	);

	const refresh = useCallback(() => loadAll(true), [loadAll]);

	useEffect(() => {
		if (!groupId) return;
		loadAll();
		const timer = setInterval(
			() => loadAll(true),
			timing.HOMEWORK_AUTO_REFRESH,
		);
		return () => clearInterval(timer);
	}, [groupId, loadAll]);

	// Re-fetch immediately when cache is invalidated externally (e.g. queue processor)
	useEffect(() => {
		if (loadedAt === null && groupId) {
			loadAll(true);
		}
	}, [loadedAt, groupId, loadAll]);

	return {
		items,
		expandedStatuses,
		counters,
		status,
		error,
		filterStatus,
		loadMore,
		refresh,
		setFilter,
		PREVIEW_SIZE,
	};
}
