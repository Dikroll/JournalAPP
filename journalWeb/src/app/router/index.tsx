import { useAuthStore } from '@/features/auth'
import {
	GradesPage,
	HomePage,
	HomeworkPage,
	LoginPage,
	ProfileDetailsPage,
	ProfilePage,
	SchedulePage,
} from '@/pages'
import { pageConfig } from '@/shared/config'
import { ScrollToTop } from '@/shared/lib'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	return isAuthenticated ? children : <Navigate to={pageConfig.login} replace />
}

export function AppRouter() {
	return (
		<HashRouter>
			<ScrollToTop />
			<Routes>
				<Route path={pageConfig.login} element={<LoginPage />} />

				<Route
					path='/'
					element={
						<ProtectedRoute>
							<AppLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<HomePage />} />
					<Route path='schedule' element={<SchedulePage />} />
					<Route path='homework' element={<HomeworkPage />} />
					<Route path='grades' element={<GradesPage />} />
					<Route path='profile' element={<ProfilePage />} />
					<Route path='profile/details' element={<ProfileDetailsPage />} />
				</Route>

				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</HashRouter>
	)
}
