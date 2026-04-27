import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FIRST_LESSON_OFFSET_OPTIONS = [15, 30, 45, 60] as const
export const REGULAR_LESSON_OFFSET_OPTIONS = [5, 10, 15, 20] as const
export const POST_LUNCH_OFFSET_OPTIONS = [5, 10, 15] as const

interface ScheduleRemindersState {
	enabled: boolean
	firstLessonEnabled: boolean
	firstLessonOffset: number
	regularLessonEnabled: boolean
	regularLessonOffset: number
	lunchBreakEnabled: boolean
	postLunchEnabled: boolean
	postLunchOffset: number
	setEnabled: (v: boolean) => void
	setFirstLessonEnabled: (v: boolean) => void
	setFirstLessonOffset: (v: number) => void
	setRegularLessonEnabled: (v: boolean) => void
	setRegularLessonOffset: (v: number) => void
	setLunchBreakEnabled: (v: boolean) => void
	setPostLunchEnabled: (v: boolean) => void
	setPostLunchOffset: (v: number) => void
}

export const useScheduleRemindersStore = create<ScheduleRemindersState>()(
	persist(
		set => ({
			enabled: true,
			firstLessonEnabled: true,
			firstLessonOffset: 30,
			regularLessonEnabled: true,
			regularLessonOffset: 15,
			lunchBreakEnabled: true,
			postLunchEnabled: true,
			postLunchOffset: 10,
			setEnabled: enabled => set({ enabled }),
			setFirstLessonEnabled: firstLessonEnabled => set({ firstLessonEnabled }),
			setFirstLessonOffset: firstLessonOffset => set({ firstLessonOffset }),
			setRegularLessonEnabled: regularLessonEnabled =>
				set({ regularLessonEnabled }),
			setRegularLessonOffset: regularLessonOffset =>
				set({ regularLessonOffset }),
			setLunchBreakEnabled: lunchBreakEnabled => set({ lunchBreakEnabled }),
			setPostLunchEnabled: postLunchEnabled => set({ postLunchEnabled }),
			setPostLunchOffset: postLunchOffset => set({ postLunchOffset }),
		}),
		{
			name: 'schedule-reminders-store',
			partialize: state => ({
				enabled: state.enabled,
				firstLessonEnabled: state.firstLessonEnabled,
				firstLessonOffset: state.firstLessonOffset,
				regularLessonEnabled: state.regularLessonEnabled,
				regularLessonOffset: state.regularLessonOffset,
				lunchBreakEnabled: state.lunchBreakEnabled,
				postLunchEnabled: state.postLunchEnabled,
				postLunchOffset: state.postLunchOffset,
			}),
		},
	),
)
