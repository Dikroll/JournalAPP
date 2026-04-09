import type { ChangelogEntry } from '@/features/sendNotifications/model/store'
import { Badge } from '@/shared/ui'
import { formatDate } from '@/shared/utils/dateUtils'
import { CheckCircle } from 'lucide-react'

export function ChangelogTab({ entries }: { entries: ChangelogEntry[] }) {
	return (
		<div className='space-y-3'>
			{entries.map((entry, idx) => (
				<div
					key={entry.id}
					className='bg-app-surface rounded-[24px] p-4 border border-app-border'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<div className='flex items-center justify-between mb-3'>
						<div className='flex items-center gap-2'>
							<span
								className='text-xs font-bold px-2 py-0.5 rounded-full'
								style={{
									background:
										idx === 0
											? 'var(--color-brand-subtle)'
											: 'var(--color-surface-strong)',
									color:
										idx === 0
											? 'var(--color-brand)'
											: 'var(--color-text-muted)',
									border:
										idx === 0
											? '1px solid var(--color-brand-border)'
											: '1px solid var(--color-border)',
								}}
							>
								v{entry.version}
							</span>
							{idx === 0 && (
								<Badge variant='success' size='xs'>Новое</Badge>
							)}
						</div>
						{entry.date && (
							<span className='text-xs text-app-muted'>
								{formatDate(entry.date)}
							</span>
						)}
					</div>

					<ul className='space-y-1.5'>
						{entry.items.map((item, i) => (
							<li key={i} className='flex items-start gap-2'>
								<CheckCircle
									size={13}
									className='text-status-checked flex-shrink-0 mt-0.5'
								/>
								<span className='text-sm text-app-text leading-snug'>
									{item}
								</span>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}
