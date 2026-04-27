import type { LucideIcon } from 'lucide-react'
import { OptionPills, type PillOption } from './OptionPills'

interface Props<T extends string | number> {
	icon: LucideIcon
	title: string
	description?: string
	options: readonly PillOption<T>[]
	selected: T
	onSelect: (value: T) => void
}

export function OptionsRow<T extends string | number>({
	icon: Icon,
	title,
	description,
	options,
	selected,
	onSelect,
}: Props<T>) {
	return (
		<div className='px-4 py-3.5 space-y-3'>
			<div className='flex items-center gap-3'>
				<div
					className='w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0'
					style={{
						background: 'var(--color-brand-subtle)',
						border: '1px solid var(--color-brand-border)',
					}}
				>
					<Icon size={15} className='text-brand' />
				</div>
				<div className='flex-1 min-w-0'>
					<p className='text-sm font-medium text-app-text'>{title}</p>
					{description && (
						<p className='text-[11px] text-app-faint mt-0.5'>{description}</p>
					)}
				</div>
			</div>
			<OptionPills options={options} selected={selected} onSelect={onSelect} />
		</div>
	)
}
