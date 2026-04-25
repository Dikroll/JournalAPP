import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScheduleRemindersState {
	enabled: boolean
	setEnabled: (enabled: boolean) => void
}

export const useScheduleRemindersStore = create<ScheduleRemindersState>()(
	persist(
		set => ({
			enabled: true,
			setEnabled: enabled => set({ enabled }),
		}),
		{
			name: 'schedule-reminders-store',
			partialize: state => ({
				enabled: state.enabled,
			}),
		},
	),
)
