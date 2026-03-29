/**
 * Универсальный компонент загрузки.
 * Раньше файл был пустым — использовался инлайн SVG в 3+ местах.
 */
export function Loader({ size = 24 }: { size?: number }) {
	return (
		<svg
			style={{ color: '#D50416' }}
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			className='animate-spin'
			aria-label='Загрузка...'
		>
			<path d='M21 12a9 9 0 1 1-6.219-8.56' />
		</svg>
	)
}

/** Полноэкранный лоадер для ProtectedRoute и PublicRoute */
export function FullscreenLoader() {
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
			<Loader size={24} />
		</div>
	)
}
