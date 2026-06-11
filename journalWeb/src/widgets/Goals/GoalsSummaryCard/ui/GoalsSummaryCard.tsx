import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { DesktopGoalsSummaryCard } from "./DesktopGoalsSummaryCard";
import { MobileGoalsSummaryCard } from "./MobileGoalsSummaryCard";

export function GoalsSummaryCard({ className }: { className?: string }) {
	const isDesktop = useIsDesktop();

	if (isDesktop) {
		return <DesktopGoalsSummaryCard className={className} />;
	}

	return <MobileGoalsSummaryCard className={className} />;
}
