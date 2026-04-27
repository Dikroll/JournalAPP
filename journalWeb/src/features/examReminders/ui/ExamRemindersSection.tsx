import {
	OptionPills,
	OptionsRow,
	SectionCard,
	SettingRow,
	SettingsDivider,
	type PillOption,
} from '@/shared/ui'
import { CalendarCheck, CalendarDays, Clock, GraduationCap } from 'lucide-react'
import {
	EXAM_NOTIFY_HOUR_OPTIONS,
	EXAM_START_DAYS_OPTIONS,
	useExamRemindersStore,
	type ExamFrequency,
} from '../model/store'

const START_DAYS_PILLS: PillOption<number>[] = EXAM_START_DAYS_OPTIONS.map(
	v => ({ value: v, label: `${v} дн.` }),
)

const NOTIFY_HOUR_PILLS: PillOption<number>[] = EXAM_NOTIFY_HOUR_OPTIONS.map(
	v => ({ value: v, label: `${v}:00` }),
)

const FREQUENCY_PILLS: PillOption<ExamFrequency>[] = [
	{ value: 'daily', label: 'Каждый день' },
	{ value: 'alternate', label: 'Через день' },
]

export function ExamRemindersSection() {
	const examEnabled = useExamRemindersStore(s => s.enabled)
	const setExamEnabled = useExamRemindersStore(s => s.setEnabled)
	const dayBeforeEnabled = useExamRemindersStore(s => s.dayBeforeEnabled)
	const setDayBeforeEnabled = useExamRemindersStore(s => s.setDayBeforeEnabled)
	const dailyEnabled = useExamRemindersStore(s => s.dailyEnabled)
	const setDailyEnabled = useExamRemindersStore(s => s.setDailyEnabled)
	const startDays = useExamRemindersStore(s => s.startDays)
	const setStartDays = useExamRemindersStore(s => s.setStartDays)
	const frequency = useExamRemindersStore(s => s.frequency)
	const setFrequency = useExamRemindersStore(s => s.setFrequency)
	const notifyHour = useExamRemindersStore(s => s.notifyHour)
	const setNotifyHour = useExamRemindersStore(s => s.setNotifyHour)

	return (
		<SectionCard title='Экзамены'>
			<SettingRow
				icon={GraduationCap}
				title='Уведомления об экзаменах'
				description='Чтобы заранее начать готовиться'
				enabled={examEnabled}
				onToggle={setExamEnabled}
			/>
			{examEnabled && (
				<>
					<SettingsDivider />
					<SettingRow
						icon={CalendarCheck}
						title='За день до экзамена'
						description='«Завтра экзамен — удачи!»'
						enabled={dayBeforeEnabled}
						onToggle={setDayBeforeEnabled}
					/>
					<SettingsDivider />
					<SettingRow
						icon={CalendarDays}
						title='Ежедневные напоминания'
						description='«Скоро экзамен — пора готовиться»'
						enabled={dailyEnabled}
						onToggle={setDailyEnabled}
						pills={START_DAYS_PILLS}
						selectedPill={startDays}
						onSelectPill={setStartDays}
					>
						<OptionPills
							options={FREQUENCY_PILLS}
							selected={frequency}
							onSelect={setFrequency}
						/>
					</SettingRow>
					<SettingsDivider />
					<OptionsRow
						icon={Clock}
						title='Время уведомления'
						description='Когда присылать ежедневные напоминания'
						options={NOTIFY_HOUR_PILLS}
						selected={notifyHour}
						onSelect={setNotifyHour}
					/>
				</>
			)}
		</SectionCard>
	)
}
