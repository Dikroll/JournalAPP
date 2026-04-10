import { AppUpdateSheet, useInitAppUpdate } from '@/features/appUpdate'
import { useInitUser } from '@/features/initUser/hooks/useInitUser'
import { AppRouter } from './router'

export function App() {
	useInitUser()
	useInitAppUpdate()

	return (
		<>
			<AppRouter />
			<AppUpdateSheet />
		</>
	)
}
