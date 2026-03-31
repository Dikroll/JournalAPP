import {
	type MaterialType,
	useLibrary,
	useLibraryByType,
} from '@/entities/library'
import { BookOpen, FileText, Lightbulb, TestTube, Video } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { LibraryMaterialCard } from '../../LibraryMaterialCard/ui/LibraryMaterialCard'

type Tab = MaterialType

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
	{ key: 1, label: 'Уроки', icon: <BookOpen size={13} /> },
	{ key: 2, label: 'Библиотека', icon: <FileText size={13} /> },
	{ key: 3, label: 'Видео', icon: <Video size={13} /> },
	{ key: 4, label: 'Статьи', icon: <Lightbulb size={13} /> },
	{ key: 5, label: 'Практика', icon: <Lightbulb size={13} /> },
	{ key: 6, label: 'Другое', icon: <FileText size={13} /> },
	{ key: 7, label: 'Тесты', icon: <TestTube size={13} /> },
	{ key: 8, label: 'Доп', icon: <FileText size={13} /> },
]

interface LibraryTabsProps {
	specId?: number
}

export const LibraryTabs = memo(function LibraryTabs({
	specId,
}: LibraryTabsProps) {
	const [active, setActive] = useState<Tab>(1)
	const scrollRef = useRef<HTMLDivElement>(null)
	const [showRight, setShowRight] = useState(true)
	const [showLeft, setShowLeft] = useState(false)
	const touchStartX = useRef(0)
	const touchStartY = useRef(0)

	const touchFiredRef = useRef(false)

	const { materials, counters, error, isLoading } = useLibrary({
		specId,
		materialType: active,
		autoLoad: true,
	})

	const materialsByType = materials // already filtered by API on request; backup filter also available
		? materials
		: useLibraryByType(active)

	const checkFades = () => {
		const el = scrollRef.current
		if (!el) return
		setShowLeft(el.scrollLeft > 8)
		setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
	}

	useEffect(() => {
		checkFades()
	}, [])

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		el.addEventListener('scroll', checkFades)
		return () => el.removeEventListener('scroll', checkFades)
	}, [])

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		const idx = TABS.findIndex(t => t.key === active)
		const btns = el.querySelectorAll<HTMLButtonElement>('button')
		const btn = btns[idx]
		if (!btn) return
		const left = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
		el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
	}, [active])

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX
		touchStartY.current = e.touches[0].clientY
	}, [])

	const makeTabHandler = useCallback(
		(key: Tab) => ({
			onTouchEnd: (e: React.TouchEvent) => {
				const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
				const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
				if (dx > 8 || dy > 8) return
				e.preventDefault()
				touchFiredRef.current = true
				setActive(key)
			},
			onClick: (e: React.MouseEvent) => {
				if (touchFiredRef.current) {
					touchFiredRef.current = false
					e.preventDefault()
					return
				}
				setActive(key)
			},
		}),
		[specId],
	)

	return (
		<div className='space-y-2'>
			<div className='relative'>
				{showLeft && (
					<div
						className='absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none'
						style={{
							background:
								'linear-gradient(to right, var(--color-bg) 0%, transparent 100%)',
						}}
					/>
				)}
				{showRight && (
					<div
						className='absolute right-0 top-0 bottom-0 z-10 pointer-events-none'
						style={{ width: 40 }}
					>
						<div
							className='absolute inset-0'
							style={{
								background:
									'linear-gradient(to left, var(--color-bg) 30%, transparent 100%)',
							}}
						/>
						<svg
							className='absolute right-1 top-1/2 -translate-y-1/2'
							width='12'
							height='12'
							viewBox='0 0 12 12'
							fill='none'
						>
							<path
								d='M4 2l4 4-4 4'
								stroke='var(--color-text-muted)'
								strokeWidth='1.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
				)}

				<div
					ref={scrollRef}
					onScroll={checkFades}
					className='flex gap-2'
					style={{
						overflowX: 'auto',
						scrollbarWidth: 'none',
						WebkitOverflowScrolling: 'touch' as any,
						paddingRight: showRight ? 32 : 4,
						paddingBottom: 2,
						scrollBehavior: 'smooth',
					}}
				>
					{TABS.map(({ key, label, icon }) => {
						const isActive = active === key
						const handlers = makeTabHandler(key)
						const count = counters?.by_type?.[key] ?? 0
						return (
							<button
								key={key}
								type='button'
								onTouchStart={handleTouchStart}
								onTouchEnd={handlers.onTouchEnd}
								onClick={handlers.onClick}
								className='flex-shrink-0 flex flex-col items-center gap-0.5 rounded-2xl text-xs font-medium whitespace-nowrap'
								style={{
									minHeight: 44,
									paddingLeft: 12,
									paddingRight: 12,
									WebkitTapHighlightColor: 'transparent',
									background: isActive
										? 'var(--color-surface-strong)'
										: 'var(--color-surface)',
									border: isActive
										? '1.5px solid var(--color-border-strong)'
										: '1px solid var(--color-border)',
									color: isActive
										? 'var(--color-text)'
										: 'var(--color-text-muted)',
									boxShadow: isActive ? 'var(--shadow-card)' : 'none',
								}}
							>
								<div className='flex items-center gap-1.5'>
									{icon}
									{label}
								</div>
								{count > 0 && (
									<span className='text-[10px] opacity-70'>{count}</span>
								)}
							</button>
						)
					})}
				</div>
			</div>

			<div className='flex justify-center items-center gap-1.5'>
				{TABS.map(({ key }) => {
					const isActive = active === key
					return (
						<div
							key={key}
							style={{
								width: isActive ? 20 : 5,
								height: 3,
								borderRadius: 2,
								background: isActive
									? 'var(--color-brand)'
									: 'var(--color-border-strong)',
								transition: 'all 0.25s ease',
							}}
						/>
					)
				})}
			</div>

			{/* Content */}
			{isLoading && (
				<div className='py-8 text-center'>
					<div className='inline-block animate-spin'>
						<div className='w-6 h-6 border-2 border-gray-300 dark:border-slate-600 border-t-blue-500 rounded-full' />
					</div>
					<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
						Загрузка материалов...
					</p>
				</div>
			)}

			{error && (
				<div className='p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg'>
					<p className='text-sm text-red-700 dark:text-red-200'>
						Ошибка: {error}
					</p>
				</div>
			)}

			{!isLoading && !error && materialsByType.length === 0 && (
				<div className='py-8 text-center'>
					<p className='text-gray-600 dark:text-gray-400 text-sm'>
						Материалы не найдены
					</p>
				</div>
			)}

			{!isLoading && !error && materialsByType.length > 0 && (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{materialsByType.map(material => (
						<LibraryMaterialCard
							key={material.material_id}
							material={material}
						/>
					))}
				</div>
			)}
		</div>
	)
})
