import { BellRing, Settings } from "lucide-react";
import { SectionCard, SettingRow } from "@/shared/ui";
import { useScheduleRemindersStore } from "../model/store";

export function MasterRemindersToggle() {
	const enabled = useScheduleRemindersStore((s) => s.enabled);
	const setEnabled = useScheduleRemindersStore((s) => s.setEnabled);

	return (
		<SectionCard title="Общее" icon={Settings}>
			<SettingRow
				icon={BellRing}
				title="Включить уведомления"
				description="Главный переключатель всех напоминаний"
				enabled={enabled}
				onToggle={setEnabled}
			/>
		</SectionCard>
	);
}
