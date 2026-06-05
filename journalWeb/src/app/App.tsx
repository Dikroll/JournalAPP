import { useFeedback } from '@/entities/feedback'
import { useInitUser } from '@/features/initUser/hooks/useInitUser'
import { useQueueProcessor } from '@/features/offlineQueue'
import { lazy, Suspense } from 'react'
import { AppRouter } from './router'

const MobileFeatures =
	import.meta.env.VITE_PLATFORM === 'web'
		? () => null
		: lazy(() => import('./MobileFeatures'))

export function App() {
	useInitUser()
	useQueueProcessor()
	useFeedback()

	return (
		<>
			<AppRouter />
			<Suspense>
				<MobileFeatures />
			</Suspense>
		</>
	)
}
