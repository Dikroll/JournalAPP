import { SectionCard, SettingRow } from '@/shared/ui'
import { BellRing } from 'lucide-react'
import { useScheduleRemindersStore } from '../model/store'

export function MasterRemindersToggle() {
	const enabled = useScheduleRemindersStore(s => s.enabled)
	const setEnabled = useScheduleRemindersStore(s => s.setEnabled)

	return (
		<SectionCard title='Общее'>
			<SettingRow
				icon={BellRing}
				title='Включить уведомления'
				description='Главный переключатель всех напоминаний'
				enabled={enabled}
				onToggle={setEnabled}
			/>
		</SectionCard>
	)
}
