import { useUser } from "@/entities/user";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { useProfileModals } from "../lib/useProfileModals";
import { DesktopProfileLayout } from "./DesktopProfileLayout";
import { MobileProfileLayout } from "./MobileProfileLayout";

export function ProfilePage() {
	const user = useUser();
	const { modals, handlers } = useProfileModals();
	const isDesktop = useIsDesktop();

	if (!user) {
		return (
			<div className="px-4 pt-4 space-y-3 max-w-4xl mx-auto w-full">
				<div className="bg-app-surface rounded-3xl h-48 animate-pulse border border-app-border" />
				<div className="bg-app-surface rounded-3xl h-24 animate-pulse border border-app-border" />
			</div>
		);
	}

	if (!isDesktop) {
		return (
			<MobileProfileLayout user={user} handlers={handlers} modals={modals} />
		);
	}

	return (
		<DesktopProfileLayout user={user} handlers={handlers} modals={modals} />
	);
}
