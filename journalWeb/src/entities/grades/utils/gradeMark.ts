export function gradeCircleStyle(
	type: string,
	value: number,
): React.CSSProperties {
	if (type === 'final') {
		return {
			background: 'rgba(168, 85, 247, 0.15)',
			borderColor: 'rgba(168, 85, 247, 0.55)',
			color: '#a855f7',
		}
	}
	if (value >= 5)
		return {
			background: 'var(--color-grade-5-bg)',
			borderColor: 'var(--color-grade-5-border)',
			color: 'var(--color-grade-5-badge)',
		}
	if (value >= 4)
		return {
			background: 'var(--color-grade-4-bg)',
			borderColor: 'var(--color-grade-4-border)',
			color: 'var(--color-grade-4-badge)',
		}
	if (value >= 3)
		return {
			background: 'var(--color-grade-3-bg)',
			borderColor: 'var(--color-grade-3-border)',
			color: 'var(--color-grade-3-badge)',
		}
	return {
		background: 'var(--color-grade-2-bg)',
		borderColor: 'var(--color-grade-2-border)',
		color: 'var(--color-grade-2-badge)',
	}
}
