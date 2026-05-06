import { useAuthStore } from '@/features/auth'
import { useHydrationStore } from '@/features/auth/model/store'
import {
	EvaluateLessonPage,
	GoalDetailPage,
	GoalsPage,
	GradesPage,
	HomePage,
	HomeworkPage,
	LibraryPage,
	LoginPage,
	NewsPage,
	NotificationSettingsPage,
	NotificationsPage,
	PaymentPage,
	ProfileActivityPage,
	ProfileDetailsPage,
	ProfilePage,
	SchedulePage,
} from '@/pages'
import { pageConfig } from '@/shared/config'
import { ScrollToTop } from '@/shared/lib'
import { FullscreenLoader } from '@/widgets/Loading/ui/Loader'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout as MobileLayout } from '../layouts'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { WebLayout } from '../layouts/ui/WebLayout'

function RootLayout() {
	const isDesktop = useIsDesktop()
	return isDesktop ? <WebLayout /> : <MobileLayout />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)

	if (!hasHydrated) return <FullscreenLoader />

	return isAuthenticated ? (
		<>{children}</>
	) : (
		<Navigate to={pageConfig.login} replace />
	)
}

function PublicRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)

	if (!hasHydrated) {
		return (
			<div
				style={{
					minHeight: '100dvh',
					backgroundColor: 'var(--color-bg, #1F2024)',
				}}
			/>
		)
	}

	const searchParams = new URLSearchParams(
		window.location.hash.split('?')[1] ?? '',
	)
	const isAddingAccount = searchParams.get('addAccount') === 'true'

	if (isAuthenticated && !isAddingAccount) {
		return <Navigate to='/' replace />
	}

	return <>{children}</>
}

export function AppRouter() {
	return (
		<HashRouter>
			<ScrollToTop />
			<Routes>
				<Route
					path={pageConfig.login}
					element={
						<PublicRoute>
							<LoginPage />
						</PublicRoute>
					}
				/>

				<Route
					path='/'
					element={
						<ProtectedRoute>
							<RootLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<HomePage />} />
					<Route path='schedule' element={<SchedulePage />} />
					<Route path='homework' element={<HomeworkPage />} />
					<Route path='library' element={<LibraryPage />} />
					<Route path='grades' element={<GradesPage />} />
					<Route path='goals' element={<GoalsPage />} />
					<Route path='goals/:specId' element={<GoalDetailPage />} />
					<Route path='profile' element={<ProfilePage />} />
					<Route path='profile/details' element={<ProfileDetailsPage />} />
					<Route path='profile/activity' element={<ProfileActivityPage />} />
					<Route
						path='profile/notification-settings'
						element={<NotificationSettingsPage />}
					/>
					<Route path='payment' element={<PaymentPage />} />
					<Route path='notifications' element={<NotificationsPage />} />
					<Route path='evaluate-lesson' element={<EvaluateLessonPage />} />
					<Route path='news' element={<NewsPage />} />
				</Route>

				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</HashRouter>
	)
}