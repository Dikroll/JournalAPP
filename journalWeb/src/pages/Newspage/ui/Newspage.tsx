import { Megaphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppUpdateStore } from "@/features/appUpdate";
import { RefreshNotificationsButton } from "@/features/refreshNotifications";
import {
	FALLBACK_CHANGELOG,
	getUnreadCount,
	useNotificationsStore,
} from "@/features/sendNotifications";
import type { ChangelogEntry } from "@/features/sendNotifications/model/store";
import { useSwipeBack } from "@/shared/hooks/useSwipeBack";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { pageConfig, PAGE_TITLES } from "@/shared/config";
import { toChangelogFeedEntry } from "@/shared/lib/appRelease";
import type { Segment } from "@/shared/ui";
import { PageHeader, SegmentedControl } from "@/shared/ui";
import { NewsTab } from "@/widgets";

type Tab = "changelog" | "news";

const TABS: Segment<Tab>[] = [
	{ key: "news", label: "Новости", icon: <Megaphone size={13} /> },
];

export function NewsPage() {
	const [activeTab, setActiveTab] = useState<Tab>("news");
	const { lastReadChangelogId, setLastRead } = useNotificationsStore();
	const latestRelease = useAppUpdateStore((s) => s.latestRelease);
	const isDesktop = useIsDesktop();

	useSwipeBack();

	const entries = useMemo<ChangelogEntry[]>(
		() =>
			latestRelease
				? [toChangelogFeedEntry(latestRelease)]
				: FALLBACK_CHANGELOG,
		[latestRelease],
	);

	useEffect(() => {
		if (latestRelease && entries.length > 0) {
			setLastRead(entries[0].id);
		}
	}, [latestRelease, entries, setLastRead]);

	useEffect(() => {
		if (activeTab === "changelog") setActiveTab("news");
	}, [activeTab]);

	const unread = getUnreadCount(lastReadChangelogId, entries);

	const tabsWithBadge = useMemo<Segment<Tab>[]>(
		() =>
			TABS.map((tab) => {
				if (
					tab.key === "changelog" &&
					unread > 0 &&
					lastReadChangelogId !== null
				) {
					return { ...tab, badge: unread };
				}
				return tab;
			}),
		[unread, lastReadChangelogId],
	);

	return (
		<div className="min-h-screen text-app-text pb-28">
			<div className="p-4 space-y-4">
				<div className="flex items-center gap-2">
					<div className="flex-1">
						<PageHeader
							title={PAGE_TITLES[pageConfig.news]}
							showBack={!isDesktop}
							actions={<RefreshNotificationsButton />}
						/>
					</div>
				</div>

				<SegmentedControl
					segments={tabsWithBadge}
					active={activeTab}
					onChange={setActiveTab}
				/>
			</div>

			<div className="px-4">

				{activeTab === "news" && <NewsTab />}
			</div>
		</div>
	);
}
