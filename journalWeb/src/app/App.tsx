import { useFeedback } from '@/entities/feedback'
import { AppUpdateSheet, useInitAppUpdate } from '@/features/appUpdate'
import { useInitScheduleReminders } from '@/features/scheduleReminders'
import { useInitUser } from '@/features/initUser/hooks/useInitUser'
import { useQueueProcessor } from '@/features/offlineQueue'
import { useNetworkInit } from '@/shared/hooks/useNetworkInit'
import { AppRouter } from './router'

export function App() {
	useInitUser()
	useInitAppUpdate()
	useInitScheduleReminders()
	useNetworkInit()
	useQueueProcessor()
	useFeedback()

	return (
		<>
			<AppRouter />
			<AppUpdateSheet />
		</>
	)
}
