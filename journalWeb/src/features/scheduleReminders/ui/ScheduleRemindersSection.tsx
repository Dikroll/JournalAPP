import {
	SectionCard,
	SettingRow,
	SettingsDivider,
	type PillOption,
} from '@/shared/ui'
import { Coffee, GraduationCap, Sunrise } from 'lucide-react'
import {
	FIRST_LESSON_OFFSET_OPTIONS,
	POST_LUNCH_OFFSET_OPTIONS,
	REGULAR_LESSON_OFFSET_OPTIONS,
	useScheduleRemindersStore,
} from '../model/store'

const minutePills = (values: readonly number[]): PillOption<number>[] =>
	values.map(v => ({ value: v, label: `${v} мин` }))

const FIRST_LESSON_PILLS = minutePills(FIRST_LESSON_OFFSET_OPTIONS)
const REGULAR_LESSON_PILLS = minutePills(REGULAR_LESSON_OFFSET_OPTIONS)
const POST_LUNCH_PILLS = minutePills(POST_LUNCH_OFFSET_OPTIONS)

export function ScheduleRemindersSection() {
	const firstLessonEnabled = useScheduleRemindersStore(s => s.firstLessonEnabled)
	const setFirstLessonEnabled = useScheduleRemindersStore(
		s => s.setFirstLessonEnabled,
	)
	const firstLessonOffset = useScheduleRemindersStore(s => s.firstLessonOffset)
	const setFirstLessonOffset = useScheduleRemindersStore(
		s => s.setFirstLessonOffset,
	)
	const regularLessonEnabled = useScheduleRemindersStore(
		s => s.regularLessonEnabled,
	)
	const setRegularLessonEnabled = useScheduleRemindersStore(
		s => s.setRegularLessonEnabled,
	)
	const regularLessonOffset = useScheduleRemindersStore(
		s => s.regularLessonOffset,
	)
	const setRegularLessonOffset = useScheduleRemindersStore(
		s => s.setRegularLessonOffset,
	)
	const lunchBreakEnabled = useScheduleRemindersStore(s => s.lunchBreakEnabled)
	const setLunchBreakEnabled = useScheduleRemindersStore(
		s => s.setLunchBreakEnabled,
	)
	const postLunchEnabled = useScheduleRemindersStore(s => s.postLunchEnabled)
	const setPostLunchEnabled = useScheduleRemindersStore(s => s.setPostLunchEnabled)
	const postLunchOffset = useScheduleRemindersStore(s => s.postLunchOffset)
	const setPostLunchOffset = useScheduleRemindersStore(s => s.setPostLunchOffset)

	return (
		<SectionCard title='Расписание'>
			<SettingRow
				icon={Sunrise}
				title='Перед первой парой'
				description='Чтобы успеть собраться и доехать'
				enabled={firstLessonEnabled}
				onToggle={setFirstLessonEnabled}
				pills={FIRST_LESSON_PILLS}
				selectedPill={firstLessonOffset}
				onSelectPill={setFirstLessonOffset}
			/>
			<SettingsDivider />
			<SettingRow
				icon={GraduationCap}
				title='Перед обычной парой'
				description='Между парами в течение дня'
				enabled={regularLessonEnabled}
				onToggle={setRegularLessonEnabled}
				pills={REGULAR_LESSON_PILLS}
				selectedPill={regularLessonOffset}
				onSelectPill={setRegularLessonOffset}
			/>
			<SettingsDivider />
			<SettingRow
				icon={Coffee}
				title='Обеденный перерыв'
				description='Уведомление в начале большого перерыва'
				enabled={lunchBreakEnabled}
				onToggle={setLunchBreakEnabled}
			/>
			<SettingsDivider />
			<SettingRow
				icon={GraduationCap}
				title='Перед парой после обеда'
				description='Чтобы вернуться вовремя'
				enabled={postLunchEnabled}
				onToggle={setPostLunchEnabled}
				pills={POST_LUNCH_PILLS}
				selectedPill={postLunchOffset}
				onSelectPill={setPostLunchOffset}
			/>
		</SectionCard>
	)
}
