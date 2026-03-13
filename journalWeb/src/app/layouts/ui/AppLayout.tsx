import { useMidnightRefresh } from '@/shared/hooks/useMidnightRefresh'
import { BottomBar, TopBar } from '@/widgets'
import { Outlet, useLocation } from 'react-router-dom'

export function AppLayout() {
	const location = useLocation()
	const showTopBar = location.pathname === '/'

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
			<div className='fixed inset-0 pointer-events-none overflow-hidden'>
				<div
					style={{
						position: 'absolute',
						top: '-200px',
						left: '50%',
						transform: 'translateX(-50%)',
						width: '700px',
						height: '500px',
						background: 'var(--glow-top)',
						borderRadius: '50%',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: '-100px',
						right: '-80px',
						width: '400px',
						height: '400px',
						background: 'var(--glow-br)',
						borderRadius: '50%',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: '-120px',
						left: '-100px',
						width: '500px',
						height: '500px',
						background: 'var(--glow-bl)',
						borderRadius: '50%',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: '-80px',
						right: '-80px',
						width: '360px',
						height: '360px',
						background: 'var(--glow-tr)',
						borderRadius: '50%',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: '35%',
						left: '50%',
						transform: 'translateX(-50%)',
						width: '500px',
						height: '400px',
						background: 'var(--glow-mid)',
						borderRadius: '50%',
					}}
				/>
			</div>

			<div style={{ display: showTopBar ? 'block' : 'none' }}>
				<TopBar />
			</div>

			<div className='pt-4'>
				<Outlet />
			</div>
			<BottomBar />
		</div>
	)
}
