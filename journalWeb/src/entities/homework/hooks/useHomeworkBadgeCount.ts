import { useEffect } from "react";
import { useUserStore } from "@/entities/user";
import { getIsOnline } from "@/shared/model/networkStore";
import { homeworkApi } from "../api";
import { STATUS_KEY_MAP } from "../configs/homeworkConfig";
import { useHomeworkStore } from "../model/store";

const badgeCounterRequests = new Map<number, Promise<void>>();
const loadedBadgeCounters = new Set<number>();

function getCachedItemsCount(
	items: ReturnType<typeof useHomeworkStore.getState>["items"],
) {
	return items[STATUS_KEY_MAP.new]?.length ?? 0;
}

export function useHomeworkBadgeCount() {
	const groupId = useUserStore((state) => state.user?.group?.id);
	const newHomeworkCount = useHomeworkStore((state) => state.counters?.new);
	const items = useHomeworkStore((state) => state.items);

	useEffect(() => {
		if (!groupId || !getIsOnline()) return;
		if (loadedBadgeCounters.has(groupId)) return;
		if (badgeCounterRequests.has(groupId)) return;

		const request = homeworkApi
			.getAll(groupId)
			.then(({ counters }) => {
				if (useUserStore.getState().user?.group?.id !== groupId) return;
				useHomeworkStore.getState().setCounters(counters);
				loadedBadgeCounters.add(groupId);
			})
			.catch(() => {})
			.finally(() => {
				badgeCounterRequests.delete(groupId);
			});

		badgeCounterRequests.set(groupId, request);
	}, [groupId]);

	return newHomeworkCount ?? getCachedItemsCount(items);
}
