import { useMidnightRefresh } from '@/app/hooks/useMidnightRefresh'
import { pageConfig } from '@/shared/config'
import { GlowBackground, OfflineBanner } from '@/shared/ui'
import { BottomBar, TopBar } from '@/widgets'
import { Outlet, useLocation } from 'react-router-dom'

export function AppLayout() {
	const location = useLocation()
	const showTopBar = location.pathname === pageConfig.home

	useMidnightRefresh()

	return (
		<div
			className='min-h-screen text-app-text relative'
			style={{
				backgroundColor: 'var(--color-bg)',
				paddingTop: 'env(safe-area-inset-top)',
				paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
				paddingLeft: 'env(safe-area-inset-left)',
				paddingRight: 'env(safe-area-inset-right)',
			}}
		>
			<GlowBackground useVariables />

			<OfflineBanner />

			<div style={{ display: showTopBar ? 'block' : 'none' }}>
				<TopBar />
			</div>

			<Outlet />

			<BottomBar />
		</div>
	)
}
