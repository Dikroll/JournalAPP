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

	const selected = subjects.find(s => s.id === selectedId) ?? null
	const filtered = subjects.filter(
		s =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.short_name.toLowerCase().includes(search.toLowerCase()),
	)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				close()
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [close])

	useEffect(() => () => close(), [])

	const handleSearchZoneClick = () => {
		setOpen(true)
		setTimeout(() => inputRef.current?.focus(), 0)
	}

	const handleToggleZoneClick = () => {
		if (open) close()
		else setOpen(true)
	}

	const handleSelect = (subject: Subject | null) => {
		onChange(subject)
		close()
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(null)
		setSearch('')
	}

	return (
		<div ref={ref} className='relative'>
			<div className='w-full flex items-center h-12 bg-white/5 border border-white/10 rounded-2xl text-sm hover:bg-white/8 overflow-hidden'>
				<div
					className='flex items-center gap-2 min-w-0 px-4 h-full cursor-pointer'
					style={{ flex: '1 1 0' }}
					onClick={handleSearchZoneClick}
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
							className={`truncate ${selected ? 'text-[#F2F2F2]' : 'text-[#6B7280]'}`}
						>
							{selected ? selected.name : 'Все предметы'}
						</span>
					)}
				</div>

				<div
					className='flex items-center justify-end gap-1.5 px-5 h-full cursor-pointer border-l border-white/5 text-[#6B7280] hover:text-[#F2F2F2] transition-colors flex-shrink-0'
					style={{ minWidth: '80px' }}
					onClick={handleToggleZoneClick}
				>
					{(selected || search) && (
						<button
							type='button'
							onClick={handleClear}
							className='p-0.5 transition-colors'
						>
							<X size={13} />
						</button>
					)}
					<ChevronDown
						size={14}
						className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
					/>
				</div>
			</div>

			{open && !loading && (
				<div
					className='absolute z-50 top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden'
					style={{
						background: 'rgba(30, 31, 35, 0.92)',
						backdropFilter: 'blur(24px)',
						border: '1px solid rgba(255,255,255,0.10)',
						boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
					}}
				>
					<div className='max-h-64 overflow-y-auto'>
						<button
							type='button'
							onClick={() => handleSelect(null)}
							className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 ${
								!selectedId
									? 'text-[#F2F2F2] font-medium bg-white/8'
									: 'text-[#9CA3AF] hover:text-[#F2F2F2] hover:bg-white/8'
							}`}
						>
							Все предметы
						</button>

						{filtered.length === 0 ? (
							<p className='text-[#6B7280] text-sm px-4 py-3'>Не найдено</p>
						) : (
							filtered.map(spec => (
								<button
									key={spec.id}
									type='button'
									onClick={() => handleSelect(spec)}
									className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${
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
							))
						)}
					</div>
				</div>
			)}
		</div>
	)
}
