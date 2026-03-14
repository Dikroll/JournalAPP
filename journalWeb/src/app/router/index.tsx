import { useAuthStore } from '@/features/auth'
import { useHydrationStore } from '@/features/auth/model/store'
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
	const hasHydrated = useHydrationStore(s => s.hasHydrated)

	if (!hasHydrated) {
		return (
			<div
				style={{
					minHeight: '100dvh',
					backgroundColor: 'var(--color-bg, #1F2024)',
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
