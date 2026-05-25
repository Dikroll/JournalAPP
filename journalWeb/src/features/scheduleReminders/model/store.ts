import { create } from "zustand";
import { persistEncrypted } from "@/shared/lib/zustandEncryptedPersist";

export const FIRST_LESSON_OFFSET_OPTIONS = [15, 30, 45, 60] as const;
export const REGULAR_LESSON_OFFSET_OPTIONS = [5, 10, 15, 20] as const;
export const POST_LUNCH_OFFSET_OPTIONS = [5, 10, 15] as const;

interface ScheduleRemindersState {
	enabled: boolean;
	firstLessonEnabled: boolean;
	firstLessonOffset: number;
	regularLessonEnabled: boolean;
	regularLessonOffset: number;
	lunchBreakEnabled: boolean;
	postLunchEnabled: boolean;
	postLunchOffset: number;
	setEnabled: (v: boolean) => void;
	setFirstLessonEnabled: (v: boolean) => void;
	setFirstLessonOffset: (v: number) => void;
	setRegularLessonEnabled: (v: boolean) => void;
	setRegularLessonOffset: (v: number) => void;
	setLunchBreakEnabled: (v: boolean) => void;
	setPostLunchEnabled: (v: boolean) => void;
	setPostLunchOffset: (v: number) => void;
}

export const useScheduleRemindersStore = create<ScheduleRemindersState>()(
	persistEncrypted(
		(set: any) => ({
			enabled: true,
			firstLessonEnabled: true,
			firstLessonOffset: 30,
			regularLessonEnabled: true,
			regularLessonOffset: 15,
			lunchBreakEnabled: true,
			postLunchEnabled: true,
			postLunchOffset: 10,
			setEnabled: (enabled: any) => set({ enabled }),
			setFirstLessonEnabled: (firstLessonEnabled: any) =>
				set({ firstLessonEnabled }),
			setFirstLessonOffset: (firstLessonOffset: any) =>
				set({ firstLessonOffset }),
			setRegularLessonEnabled: (regularLessonEnabled: any) =>
				set({ regularLessonEnabled }),
			setRegularLessonOffset: (regularLessonOffset: any) =>
				set({ regularLessonOffset }),
			setLunchBreakEnabled: (lunchBreakEnabled: any) =>
				set({ lunchBreakEnabled }),
			setPostLunchEnabled: (postLunchEnabled: any) => set({ postLunchEnabled }),
			setPostLunchOffset: (postLunchOffset: any) => set({ postLunchOffset }),
		}),
		{
			name: "schedule-reminders-store",
			partialize: (state: any) => ({
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
);
