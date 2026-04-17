import { RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props {
	isRefreshing: boolean
	onRefresh: () => void
	disabled?: boolean
	className?: string
	/** Минимальное время отображения анимации вращения, мс. */
	minSpinMs?: number
}

export function RefreshButton({
	isRefreshing,
	onRefresh,
	disabled,
	className,
	minSpinMs = 0,
}: Props) {
	const [holding, setHolding] = useState(false)
	const startedAtRef = useRef<number | null>(null)

	useEffect(() => {
		if (minSpinMs <= 0) return
		if (isRefreshing) {
			startedAtRef.current = Date.now()
			setHolding(true)
			return
		}
		if (startedAtRef.current === null) return
		const elapsed = Date.now() - startedAtRef.current
		const remaining = minSpinMs - elapsed
		if (remaining <= 0) {
			setHolding(false)
			startedAtRef.current = null
			return
		}
		const id = setTimeout(() => {
			setHolding(false)
			startedAtRef.current = null
		}, remaining)
		return () => clearTimeout(id)
	}, [isRefreshing, minSpinMs])

	const spinning = isRefreshing || holding

	return (
		<button
			type='button'
			onClick={onRefresh}
			disabled={spinning || disabled}
			className={
				className ??
				'flex items-center gap-1.5 px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text)] hover:text-[var(--color-text)] text-sm disabled:opacity-50'
			}
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<RefreshCw size={15} className={spinning ? 'animate-spin' : ''} />
			Обновить
		</button>
	)
}
