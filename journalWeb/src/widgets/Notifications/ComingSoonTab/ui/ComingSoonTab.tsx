import { Bell } from 'lucide-react'

export function ComingSoonTab({ label }: { label: string }) {
	return (
		<div className='flex flex-col items-center justify-center py-16 gap-3'>
			<div
				className='w-16 h-16 rounded-[20px] flex items-center justify-center'
				style={{
					background: 'var(--color-surface-strong)',
					border: '1px solid var(--color-border)',
				}}
			>
				<Bell size={24} className='text-app-muted' />
			</div>
			<p className='text-base font-semibold text-app-text'>{label}</p>
			<p className='text-sm text-app-muted text-center px-8'>
				Раздел появится в одном из следующих обновлений
			</p>
		</div>
	)
}
