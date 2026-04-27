import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const EXAM_START_DAYS_OPTIONS = [3, 5, 7, 14] as const
export const EXAM_NOTIFY_HOUR_OPTIONS = [15, 16, 17, 18, 19] as const

export type ExamFrequency = 'daily' | 'alternate'

interface ExamRemindersState {
	enabled: boolean
	dayBeforeEnabled: boolean
	dailyEnabled: boolean
	startDays: number
	frequency: ExamFrequency
	notifyHour: number
	setEnabled: (v: boolean) => void
	setDayBeforeEnabled: (v: boolean) => void
	setDailyEnabled: (v: boolean) => void
	setStartDays: (v: number) => void
	setFrequency: (v: ExamFrequency) => void
	setNotifyHour: (v: number) => void
}

export const useExamRemindersStore = create<ExamRemindersState>()(
	persist(
		set => ({
			enabled: true,
			dayBeforeEnabled: true,
			dailyEnabled: true,
			startDays: 7,
			frequency: 'daily',
			notifyHour: 17,
			setEnabled: enabled => set({ enabled }),
			setDayBeforeEnabled: dayBeforeEnabled => set({ dayBeforeEnabled }),
			setDailyEnabled: dailyEnabled => set({ dailyEnabled }),
			setStartDays: startDays => set({ startDays }),
			setFrequency: frequency => set({ frequency }),
			setNotifyHour: notifyHour => set({ notifyHour }),
		}),
		{
			name: 'exam-reminders-store',
			partialize: state => ({
				enabled: state.enabled,
				dayBeforeEnabled: state.dayBeforeEnabled,
				dailyEnabled: state.dailyEnabled,
				startDays: state.startDays,
				frequency: state.frequency,
				notifyHour: state.notifyHour,
			}),
		},
	),
)
