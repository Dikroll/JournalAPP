import { LayoutGrid, List } from 'lucide-react'

export type HomeworkViewMode = 'list' | 'photo'

interface Props {
	mode: HomeworkViewMode
	onChange: (mode: HomeworkViewMode) => void
}

export function HomeworkViewToggle({ mode, onChange }: Props) {
	return (
		<div className='flex items-center gap-1 bg-app-surface border border-app-border rounded-2xl p-1'>
			<button
				type='button'
				onClick={() => onChange('list')}
				title='Список'
				className={[
					'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
					mode === 'list'
						? 'bg-app-surface-active text-app-text shadow-sm'
						: 'text-app-muted hover:text-app-text',
				].join(' ')}
			>
				<List size={14} />
				<span>Список</span>
			</button>
			<button
				type='button'
				onClick={() => onChange('photo')}
				title='Фото'
				className={[
					'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
					mode === 'photo'
						? 'bg-app-surface-active text-app-text shadow-sm'
						: 'text-app-muted hover:text-app-text',
				].join(' ')}
			>
				<LayoutGrid size={14} />
				<span>Фото</span>
			</button>
		</div>
	)
}
