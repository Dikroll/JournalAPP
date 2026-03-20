import { useAuthStore } from '@/features/auth'
import {
	GradesPage,
	HomePage,
	HomeworkPage,
	LoginPage,
	ProfileDetailsPage,
	ProfilePage,
	SchedulePage,
	PaymentPage,
} from '@/pages'
import { pageConfig } from '@/shared/config'
import { ScrollToTop } from '@/shared/lib'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useAuthStore(s => s._hasHydrated)

	if (!hasHydrated) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#1F2024',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<svg
					style={{ color: '#D50416' }}
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					className='animate-spin'
				>
					<path d='M21 12a9 9 0 1 1-6.219-8.56' />
				</svg>
			</div>
		)
	}

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
					<Route path='payment' element={<PaymentPage />} />
				</Route>

				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</HashRouter>
	)
}
