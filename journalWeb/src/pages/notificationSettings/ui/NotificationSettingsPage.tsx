import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExamRemindersSection } from "@/features/examReminders";
import {
	MasterRemindersToggle,
	ScheduleRemindersSection,
	useScheduleRemindersStore,
} from "@/features/scheduleReminders";
import { useSwipeBack } from "@/shared/hooks";
import { pageConfig, PAGE_TITLES } from "@/shared/config";
import { IconButton, PageHeader } from "@/shared/ui";

export function NotificationSettingsPage() {
	const navigate = useNavigate();
	useSwipeBack();

	const enabled = useScheduleRemindersStore((s) => s.enabled);

	return (
		<div className="pb-6 text-app-text">
			<div className="flex items-center gap-2 px-4 pt-4 pb-4">
				<IconButton
					icon={<ArrowLeft size={18} />}
					onClick={() => navigate(-1)}
					size="md"
					shape="square"
					variant="surface"
					style={{ boxShadow: "var(--shadow-card)" }}
					aria-label="Назад"
				/>
				<div className="flex-1">
					<PageHeader title={PAGE_TITLES[pageConfig.notificationSettings]} />
				</div>
			</div>

			<div className="px-4 space-y-4">
				<MasterRemindersToggle />
				{enabled && <ScheduleRemindersSection />}
				{enabled && <ExamRemindersSection />}
			</div>
		</div>
	);
}
