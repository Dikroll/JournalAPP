import type { ProfileRelative } from '@/entities/profile'
import { AtSign, ChevronDown, Home, Phone, Users } from 'lucide-react'
import { useState } from 'react'
import { phoneTypeLabel } from './ProfileInfoCard'
import { Divider, InfoRow } from './shared/ProfileInfoParts'

function RelativeItem({
	relative,
	index,
}: {
	relative: ProfileRelative
	index: number
}) {
	const [open, setOpen] = useState(false)
	const initials = relative.full_name
		.split(' ')
		.map(n => n[0])
		.join('')
		.slice(0, 2)

	const hasDetails =
		!!relative.address ||
		relative.phones.length > 0 ||
		relative.emails.length > 0

	return (
		<div className='border border-app-border rounded-[20px] overflow-hidden bg-app-surface'>
			<div className='flex items-center gap-3 p-4'>
				<div
					className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0'
					style={{
						background:
							index % 2 === 0
								? 'linear-gradient(135deg,#F20519,#F29F05)'
								: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
					}}
				>
					{initials}
				</div>
				<div className='flex-1 min-w-0'>
					<p className='text-sm font-semibold text-app-text'>
						{relative.full_name}
					</p>
					<p className='text-xs text-app-muted'>{relative.relationship}</p>
				</div>
				{hasDetails && (
					<button
						className='shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-app-surface active:bg-app-surface-hover transition-colors'
						onClick={() => setOpen(v => !v)}
					>
						<ChevronDown
							size={16}
							className='text-app-muted transition-transform duration-200'
							style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
						/>
					</button>
				)}
			</div>

			{hasDetails && (
				<div
					style={{
						maxHeight: open ? '400px' : '0px',
						overflow: 'hidden',
						transition: 'max-height 0.3s ease',
					}}
				>
					<div className='px-4 pb-4 border-t border-app-border'>
						{relative.address && (
							<InfoRow
								icon={<Home size={15} />}
								label='Адрес'
								value={relative.address}
							/>
						)}
						{relative.phones.map(p => (
							<div key={p.number}>
								<Divider />
								<InfoRow
									icon={<Phone size={15} />}
									label={phoneTypeLabel(p.type)}
									value={p.number}
								/>
							</div>
						))}
						{relative.emails.map(e => (
							<div key={e}>
								<Divider />
								<InfoRow icon={<AtSign size={15} />} label='Email' value={e} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

interface Props {
	relatives: ProfileRelative[]
}

export function ProfileRelativesCard({ relatives }: Props) {
	if (!relatives.length) return null

	return (
		<div
			className='bg-app-surface backdrop-blur-xl rounded-[24px] border border-app-border overflow-hidden'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<div className='flex items-center gap-2 px-5 pt-5 pb-3'>
				<Users size={16} className='text-app-muted' />
				<p className='text-[11px] font-semibold text-app-muted uppercase tracking-wider'>
					Родственники
				</p>
				<span className='ml-auto text-xs font-semibold text-app-text bg-app-surface-strong px-2 py-0.5 rounded-full'>
					{relatives.length}
				</span>
			</div>
			<div className='px-4 pb-4 space-y-2'>
				{relatives.map((r, i) => (
					<RelativeItem key={r.full_name} relative={r} index={i} />
				))}
			</div>
		</div>
	)
}
