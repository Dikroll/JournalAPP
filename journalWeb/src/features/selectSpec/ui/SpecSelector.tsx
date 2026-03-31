import type { Subject } from '@/entities/subject'
import { ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSpecSelectorStore } from '../models/store'

interface Props {
	subjects: Subject[]
	selectedId: number | null
	onChange: (subject: Subject | null) => void
	loading?: boolean
}

export function SpecSelector({
	subjects,
	selectedId,
	onChange,
	loading,
}: Props) {
	const { open, search, setOpen, setSearch, close } = useSpecSelectorStore()
	const ref = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	// Suppress ghost clicks on iOS after touchend
	const touchFiredRef = useRef(false)

	const selected = subjects.find(s => s.id === selectedId) ?? null
	const filtered = subjects.filter(
		s =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.short_name.toLowerCase().includes(search.toLowerCase()),
	)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) close()
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [close])

	useEffect(() => () => close(), [])

	const handleSelect = (subject: Subject | null) => {
		onChange(subject)
		close()
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(null)
		setSearch('')
	}

	// Touch-aware open handler for the search area
	const touchStartYRef = useRef(0)
	const onSearchTouchStart = (e: React.TouchEvent) => {
		touchStartYRef.current = e.touches[0].clientY
	}
	const onSearchTouchEnd = (e: React.TouchEvent) => {
		if (Math.abs(e.changedTouches[0].clientY - touchStartYRef.current) > 8)
			return
		e.preventDefault()
		touchFiredRef.current = true
		setOpen(true)
		setTimeout(() => inputRef.current?.focus(), 0)
	}
	const onSearchClick = () => {
		if (touchFiredRef.current) {
			touchFiredRef.current = false
			return
		}
		setOpen(true)
		setTimeout(() => inputRef.current?.focus(), 0)
	}

	// Touch-aware chevron/toggle handler
	const onChevronTouchEnd = (e: React.TouchEvent) => {
		if (Math.abs(e.changedTouches[0].clientY - touchStartYRef.current) > 8)
			return
		e.preventDefault()
		touchFiredRef.current = true
		open ? close() : setOpen(true)
	}
	const onChevronClick = () => {
		if (touchFiredRef.current) {
			touchFiredRef.current = false
			return
		}
		open ? close() : setOpen(true)
	}

	// Touch-aware item select handler factory
	const makeItemHandlers = (subject: Subject | null) => {
		const itemTouchStartY = { current: 0 }
		const itemTouchFired = { current: false }
		return {
			onTouchStart: (e: React.TouchEvent) => {
				itemTouchStartY.current = e.touches[0].clientY
			},
			onTouchEnd: (e: React.TouchEvent) => {
				if (Math.abs(e.changedTouches[0].clientY - itemTouchStartY.current) > 8)
					return
				e.preventDefault()
				itemTouchFired.current = true
				handleSelect(subject)
			},
			onClick: () => {
				if (itemTouchFired.current) {
					itemTouchFired.current = false
					return
				}
				handleSelect(subject)
			},
		}
	}

	return (
		<div ref={ref} className='relative'>
			<div className='w-full flex items-center h-12 bg-white/5 border border-white/10 rounded-2xl text-sm hover:bg-white/8 overflow-hidden'>
				<div
					className='flex items-center gap-2 min-w-0 px-4 h-full cursor-pointer'
					style={{ flex: '1 1 0', WebkitTapHighlightColor: 'transparent' }}
					onTouchStart={onSearchTouchStart}
					onTouchEnd={onSearchTouchEnd}
					onClick={onSearchClick}
				>
					<Search size={14} className='text-[#6B7280] flex-shrink-0' />
					{loading ? (
						<span className='text-[#6B7280]'>Загрузка предметов...</span>
					) : open ? (
						<input
							ref={inputRef}
							type='text'
							placeholder='Поиск...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							onClick={e => e.stopPropagation()}
							className='flex-1 bg-transparent outline-none placeholder-[#6B7280] text-[#F2F2F2] min-w-0 cursor-text h-full'
							style={{ caretColor: '#F2F2F2' }}
						/>
					) : (
						<span
							className={`truncate ${
								selected ? 'text-[#F2F2F2]' : 'text-[#6B7280]'
							}`}
						>
							{selected ? selected.name : 'Все предметы'}
						</span>
					)}
				</div>

				<div
					className='flex items-center justify-end gap-1.5 px-5 h-full cursor-pointer border-l border-white/5 text-[#6B7280] hover:text-[#F2F2F2] flex-shrink-0'
					style={{ minWidth: '80px', WebkitTapHighlightColor: 'transparent' }}
					onTouchStart={onSearchTouchStart}
					onTouchEnd={onChevronTouchEnd}
					onClick={onChevronClick}
				>
					{(selected || search) && (
						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								e.preventDefault()
								onChange(null)
								setSearch('')
							}}
							onClick={handleClear}
							className='p-0.5'
							style={{ WebkitTapHighlightColor: 'transparent' }}
						>
							<X size={13} />
						</button>
					)}
					<ChevronDown
						size={14}
						className={`transition-transform duration-200 ${
							open ? 'rotate-180' : ''
						}`}
					/>
				</div>
			</div>

			{open && !loading && (
				<div
					className='absolute z-50 top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden backdrop-blur-xl'
					style={{
						background: 'rgba(30, 31, 35, 0.92)',
						border: '1px solid rgba(255,255,255,0.10)',
						boxShadow: 'var(--shadow-dropdown)',
					}}
				>
					<div className='max-h-64 overflow-y-auto'>
						{(() => {
							const allHandlers = makeItemHandlers(null)
							return (
								<button
									type='button'
									onTouchStart={allHandlers.onTouchStart}
									onTouchEnd={allHandlers.onTouchEnd}
									onClick={allHandlers.onClick}
									style={{ WebkitTapHighlightColor: 'transparent' }}
									className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 ${
										!selectedId
											? 'text-[#F2F2F2] font-medium bg-white/8'
											: 'text-[#9CA3AF] hover:text-[#F2F2F2] hover:bg-white/8'
									}`}
								>
									Все предметы
								</button>
							)
						})()}

						{filtered.length === 0 ? (
							<p className='text-[#6B7280] text-sm px-4 py-3'>Не найдено</p>
						) : (
							filtered.map(spec => {
								const itemHandlers = makeItemHandlers(spec)
								return (
									<button
										key={spec.id}
										type='button'
										onTouchStart={itemHandlers.onTouchStart}
										onTouchEnd={itemHandlers.onTouchEnd}
										onClick={itemHandlers.onClick}
										style={{ WebkitTapHighlightColor: 'transparent' }}
										className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 last:border-0 ${
											spec.id === selectedId
												? 'text-[#F2F2F2] font-medium bg-white/8'
												: 'text-[#9CA3AF] hover:text-[#F2F2F2] hover:bg-white/8'
										}`}
									>
										<span className='block truncate'>{spec.name}</span>
										<span className='text-[10px] text-[#6B7280]'>
											{spec.short_name}
										</span>
									</button>
								)
							})
						)}
					</div>
				</div>
			)}
		</div>
	)
}
