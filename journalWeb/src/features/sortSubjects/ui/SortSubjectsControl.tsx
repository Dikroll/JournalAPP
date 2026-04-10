import type { SortKey } from '@/entities/grades'
import { ArrowDownUp } from 'lucide-react'
import { useSortSubjectsStore } from '../model/store'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
	{ key: 'alpha', label: 'А–Я' },
	{ key: 'grade-desc', label: '5→1' },
	{ key: 'grade-asc', label: '1→5' },
]

export function SortSubjectsControl() {
	const { sortKey, setSortKey } = useSortSubjectsStore()

	return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-1.5 text-xs text-app-muted'>
				<ArrowDownUp size={12} />
				<span>Сортировка</span>
			</div>
			<div className='flex gap-1'>
				{SORT_OPTIONS.map(({ key, label }) => (
					<button
						key={key}
						type='button'
						onClick={() => setSortKey(key)}
						className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
							sortKey === key
								? 'bg-glass-strong text-app-text border-glass-strong'
								: 'bg-glass text-app-muted border-glass-border hover:text-app-text hover:bg-glass-hover'
						}`}
					>
						{label}
					</button>
				))}
			</div>
		</div>
	)
}
