import { useEffect, useState } from "react";
import { useFeedbackStore } from "@/entities/feedback";
import { useUserStore } from "@/entities/user";
import { useAppUpdateStore } from "@/features/appUpdate";
import {
	getUnreadCount,
	useNotificationsStore,
} from "@/features/sendNotifications";
import { getCachedImageUrl } from "@/shared/lib";
import { toChangelogFeedEntry } from "@/shared/lib/appRelease";
import { useHydrationStore } from "@/shared/lib/hydrationStore";
import { getInitials, getShortName } from "@/shared/utils/nameUtils";

function useUserStoreHydrated() {
	const hasHydrated = useHydrationStore((state) => state.hasHydrated);
	const [hydrated, setHydrated] = useState(hasHydrated);

	useEffect(() => {
		setHydrated(useHydrationStore.getState().hasHydrated);
	}, []);

	return hydrated;
}

export function useTopBarViewModel() {
	const fullName = useUserStore((state) => state.user?.full_name);
	const groupName = useUserStore((state) => state.user?.group.name);
	const photoUrl = getCachedImageUrl(
		useUserStore((state) => state.user?.photo_url),
	);
	const hydrated = useUserStoreHydrated();

	const { lastReadChangelogId } = useNotificationsStore();
	const latestRelease = useAppUpdateStore((state) => state.latestRelease);
	const changelogEntries = latestRelease
		? [toChangelogFeedEntry(latestRelease)]
		: undefined;
	const unreadCount = getUnreadCount(lastReadChangelogId, changelogEntries);
	const pendingFeedbackCount = useFeedbackStore(
		(state) => state.pending.length,
	);

	if (!fullName) {
		return null;
	}

	return {
		fullName,
		groupName: groupName ?? "",
		photoUrl,
		hydrated,
		initials: getInitials(fullName),
		shortName: getShortName(fullName),
		hasBadge: unreadCount > 0 || pendingFeedbackCount > 0,
	};
}
