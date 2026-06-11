import { RefreshNotificationsButton } from "@/features/refreshNotifications";
import { PAGE_TITLES, pageConfig } from "@/shared/config";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { useSwipeBack } from "@/shared/hooks/useSwipeBack";
import { PageHeader } from "@/shared/ui";
import { NewsTab } from "@/widgets";

export function NewsPage() {
	const isDesktop = useIsDesktop();

	useSwipeBack();

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
			</div>

			<div className="px-4">
				<NewsTab />
			</div>
		</div>
	);
}
