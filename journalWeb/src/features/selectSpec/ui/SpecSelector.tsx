import type { Subject } from '@/entities/subject'
import { ChevronDown, Search, X } from 'lucide-react'
import { useSpecSelector } from '../hooks/useSpecSelect'

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
	const {
		ref,
		inputRef,
		open,
		search,
		selected,
		filtered,
		setSearch,
		openWithFocus,
		toggleWithoutFocus,
		handleSelect,
		handleClear,
	} = useSpecSelector({ subjects, selectedId, onChange })

	return (
		<div ref={ref} className='relative'>
			<div
				className='w-full flex items-center h-12 bg-app-surface border border-app-border rounded-2xl text-sm hover:bg-app-surface-hover overflow-hidden'
				onClick={openWithFocus}
			>
				<div className='flex items-center gap-2 min-w-0 px-4 h-full flex-1'>
					<Search size={14} className='text-app-muted flex-shrink-0' />

					{loading ? (
						<span className='text-app-muted'>Загрузка предметов...</span>
					) : open ? (
						<input
							ref={inputRef}
							type='text'
							placeholder='Поиск...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							className='flex-1 bg-transparent outline-none placeholder:text-app-muted text-app-text min-w-0 cursor-text h-full'
						/>
					) : (
						<span
							className={`truncate ${
								selected ? 'text-app-text' : 'text-app-muted'
							}`}
						>
							{selected ? selected.name : 'Все предметы'}
						</span>
					)}
				</div>

				<div
					className='flex items-center justify-end gap-1.5 px-5 h-full cursor-pointer border-l border-app-border text-app-muted hover:text-app-text flex-shrink-0'
					onClick={e => {
						e.stopPropagation()
						toggleWithoutFocus()
					}}
				>
					{(selected || search) && (
						<button
							type='button'
							onClick={e => {
								e.stopPropagation()
								handleClear()
							}}
							className='p-0.5'
						>
							<X size={13} />
						</button>
					)}

					<ChevronDown
						className={`transition-transform duration-200 ${
							open ? 'rotate-180' : ''
						}`}
					/>
				</div>
			</div>

			{open && !loading && (
				<div
					className='absolute z-50 top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden'
					style={{
						background: 'var(--color-modal-bg)',
						border: '1px solid var(--color-border)',
						boxShadow: 'var(--shadow-dropdown)',
					}}
				>
					<div className='max-h-64 overflow-y-auto'>
						<button
							type='button'
							onClick={() => handleSelect(null)}
							className={`w-full text-left px-4 py-3 text-sm border-b ${
								!selectedId
									? 'text-app-text font-medium bg-app-surface-hover'
									: 'text-app-muted hover:text-app-text hover:bg-app-surface-hover'
							}`}
							style={{ borderColor: 'var(--color-border)' }}
						>
							Все предметы
						</button>

						{filtered.length === 0 ? (
							<p className='text-app-muted text-sm px-4 py-3'>Не найдено</p>
						) : (
							filtered.map(spec => (
								<button
									key={spec.id}
									type='button'
									onClick={() => handleSelect(spec)}
									className={`w-full text-left px-4 py-3 text-sm border-b last:border-0 ${
										spec.id === selectedId
											? 'text-app-text font-medium bg-app-surface-hover'
											: 'text-app-muted hover:text-app-text hover:bg-app-surface-hover'
									}`}
									style={{ borderColor: 'var(--color-border)' }}
								>
									<span className='block truncate'>{spec.name}</span>
									<span className='text-[10px] text-app-faint'>
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
