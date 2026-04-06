interface GlowBackgroundProps {
	useVariables?: boolean
}

/**
 * Decorative glowing background effect with 5 gradient blobs.
 * Can use CSS variables (for AppLayout) or inline gradients (for LoginForm)
 */
export function GlowBackground({ useVariables = false }: GlowBackgroundProps) {
	if (useVariables) {
		return (
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
		)
	}

	return (
		<>
			<div
				style={{
					position: 'fixed',
					top: '-200px',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '700px',
					height: '500px',
					background:
						'radial-gradient(ellipse, rgba(60,63,70,0.3) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'fixed',
					bottom: '-100px',
					right: '-80px',
					width: '400px',
					height: '400px',
					background:
						'radial-gradient(circle, rgba(50,53,60,0.6) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'fixed',
					bottom: '-120px',
					left: '-100px',
					width: '500px',
					height: '500px',
					background:
						'radial-gradient(circle, rgba(242,5,25,0.1) 0%, rgba(242,5,25,0.04) 40%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'fixed',
					top: '-80px',
					right: '-80px',
					width: '360px',
					height: '360px',
					background:
						'radial-gradient(circle, rgba(242,5,25,0.06) 0%, transparent 65%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'fixed',
					top: '35%',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '500px',
					height: '400px',
					background:
						'radial-gradient(ellipse, rgba(180,185,195,0.04) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
		</>
	)
}
