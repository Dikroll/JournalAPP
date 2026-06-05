import { useAuthStore } from '@/features/auth'
import { pageConfig } from '@/shared/config'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { ScrollToTop } from '@/shared/lib'
import { isNativeRuntime } from '@/shared/lib/platform'
import { useHydrationStore } from '@/shared/model/authStore'
import { FullscreenLoader } from '@/widgets/Loading/ui/Loader'
import { lazy, Suspense } from 'react'
import {
	BrowserRouter,
	HashRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom'
import { AppLayout as MobileLayout, WebLayout } from '../layouts'

const EvaluateLessonPage = lazy(() =>
	import('@/pages/evaluateLesson/ui/EvaluateLessonPage').then(m => ({
		default: m.EvaluateLessonPage,
	})),
)
const GoalDetailPage = lazy(() =>
	import('@/pages/goals/ui/GoalDetailPage').then(m => ({
		default: m.GoalDetailPage,
	})),
)
const GoalsPage = lazy(() =>
	import('@/pages/goals/ui/GoalsPage').then(m => ({ default: m.GoalsPage })),
)
const GradesPage = lazy(() =>
	import('@/pages/grades/ui/GradesPage').then(m => ({
		default: m.GradesPage,
	})),
)
const HomePage = lazy(() =>
	import('@/pages/home/ui/HomePage').then(m => ({ default: m.HomePage })),
)
const HomeworkPage = lazy(() =>
	import('@/pages/homework/ui/HomeworkPage').then(m => ({
		default: m.HomeworkPage,
	})),
)
const LibraryPage = lazy(() =>
	import('@/pages/library/ui/LibraryPage').then(m => ({
		default: m.LibraryPage,
	})),
)
const LoginPage = lazy(() =>
	import('@/pages/login/ui/LoginPage').then(m => ({ default: m.LoginPage })),
)
const MarketPage = lazy(() =>
	import('@/pages/market/ui/MarketPage').then(m => ({
		default: m.MarketPage,
	})),
)
const NewsDetailPage = lazy(() =>
	import('@/pages/notifications/ui/NewsDetailPage').then(m => ({
		default: m.NewsDetailPage,
	})),
)
const NewsPage = lazy(() =>
	import('@/pages/Newspage/ui/Newspage').then(m => ({ default: m.NewsPage })),
)
const NotificationSettingsPage = lazy(() =>
	import('@/pages/notificationSettings/ui/NotificationSettingsPage').then(
		m => ({ default: m.NotificationSettingsPage }),
	),
)
const NotificationsPage = lazy(() =>
	import('@/pages/notifications/ui/NotificationsPage').then(m => ({
		default: m.NotificationsPage,
	})),
)
const PaymentPage = lazy(() =>
	import('@/pages/payment/ui/PaymentPage').then(m => ({
		default: m.PaymentPage,
	})),
)
const ProfileActivityPage = lazy(() =>
	import('@/pages/profileActivity/ui/ProfileActivityPage').then(m => ({
		default: m.ProfileActivityPage,
	})),
)
const ProfileDetailsPage = lazy(() =>
	import('@/pages/profileDetail/ui/ProfileDetailPage').then(m => ({
		default: m.ProfileDetailsPage,
	})),
)
const ProfilePage = lazy(() =>
	import('@/pages/profile/ui/ProfilePage').then(m => ({
		default: m.ProfilePage,
	})),
)
const SchedulePage = lazy(() =>
	import('@/pages/schedule/ui/SchedulePage').then(m => ({
		default: m.SchedulePage,
	})),
)

function RootLayout() {
	const isDesktop = useIsDesktop()
	return isDesktop ? <WebLayout /> : <MobileLayout />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)

	if (!hasHydrated) return <FullscreenLoader />

	return isAuthenticated ? children : <Navigate to={pageConfig.login} replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const location = useLocation()

	if (!hasHydrated) return <FullscreenLoader />

	const searchParams = new URLSearchParams(location.search)
	const isAddingAccount = searchParams.get('addAccount') === 'true'

	if (isAuthenticated && !isAddingAccount) {
		return <Navigate to='/' replace />
	}

	return <>{children}</>
}

function MobileOnlyRoute({ children }: { children: React.ReactNode }) {
	const isDesktop = useIsDesktop()

	return isDesktop ? <Navigate to={pageConfig.news} replace /> : <>{children}</>
}

import { ErrorBoundary } from '@/shared/ui'

const Suspended = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<FullscreenLoader />}>{children}</Suspense>
)

function AppRoutes() {
	const location = useLocation()

	return (
		<ErrorBoundary key={location.key} fallback={<FullscreenLoader />}>
			<ScrollToTop />
			<Suspense fallback={<FullscreenLoader />}>
				<Routes>
					<Route
						path={pageConfig.login}
						element={
							<PublicRoute>
								<Suspended>
									<LoginPage />
								</Suspended>
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
						<Route
							index
							element={
								<Suspended>
									<HomePage />
								</Suspended>
							}
						/>
						<Route
							path='schedule'
							element={
								<Suspended>
									<SchedulePage />
								</Suspended>
							}
						/>
						<Route
							path='homework'
							element={
								<Suspended>
									<HomeworkPage />
								</Suspended>
							}
						/>
						<Route
							path='library'
							element={
								<Suspended>
									<LibraryPage />
								</Suspended>
							}
						/>
						<Route
							path='grades'
							element={
								<Suspended>
									<GradesPage />
								</Suspended>
							}
						/>
						<Route
							path='goals'
							element={
								<Suspended>
									<GoalsPage />
								</Suspended>
							}
						/>
						<Route
							path='goals/:specId'
							element={
								<Suspended>
									<GoalDetailPage />
								</Suspended>
							}
						/>
						<Route
							path='profile'
							element={
								<Suspended>
									<ProfilePage />
								</Suspended>
							}
						/>
						<Route
							path='profile/details'
							element={
								<Suspended>
									<ProfileDetailsPage />
								</Suspended>
							}
						/>
						<Route
							path='profile/activity'
							element={
								<Suspended>
									<ProfileActivityPage />
								</Suspended>
							}
						/>
						<Route
							path='profile/notification-settings'
							element={
								<Suspended>
									<NotificationSettingsPage />
								</Suspended>
							}
						/>
						<Route
							path='market'
							element={
								<Suspended>
									<MarketPage />
								</Suspended>
							}
						/>
						<Route
							path='payment'
							element={
								<Suspended>
									<PaymentPage />
								</Suspended>
							}
						/>
						<Route
							path='notifications'
							element={
								<MobileOnlyRoute>
									<Suspended>
										<NotificationsPage />
									</Suspended>
								</MobileOnlyRoute>
							}
						/>
						<Route
							path='notifications/news/:id'
							element={
								<MobileOnlyRoute>
									<Suspended>
										<NewsDetailPage />
									</Suspended>
								</MobileOnlyRoute>
							}
						/>
						<Route
							path='evaluate-lesson'
							element={
								<Suspended>
									<EvaluateLessonPage />
								</Suspended>
							}
						/>
						<Route
							path='news'
							element={
								<Suspended>
									<NewsPage />
								</Suspended>
							}
						/>
						<Route
							path='news/:id'
							element={
								<Suspended>
									<NewsDetailPage />
								</Suspended>
							}
						/>
					</Route>

					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Suspense>
		</ErrorBoundary>
	)
}

function normalizeWebHashUrl() {
	if (isNativeRuntime) return
	if (!window.location.hash.startsWith('#/')) return

	const hashRoute = window.location.hash.slice(1)
	const search = hashRoute.includes('?') ? '' : window.location.search
	window.history.replaceState(null, '', `${hashRoute}${search}`)
}

export function AppRouter() {
	normalizeWebHashUrl()
	const Router = isNativeRuntime ? HashRouter : BrowserRouter

	return (
		<Router>
			<AppRoutes />
		</Router>
	)
}
