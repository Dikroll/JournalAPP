import type { ProfileRelative } from '@/entities/profile'
import { AtSign, ChevronDown, Home, Phone, Users } from 'lucide-react'
import { useState } from 'react'

function phoneTypeLabel(type: number) {
	const map: Record<number, string> = {
		0: 'Мобильный',
		1: 'Домашний',
		2: 'Рабочий',
	}
	return map[type] ?? 'Телефон'
}

function Divider() {
	return <div className='h-px bg-white/5' />
}

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode
	label: string
	value: string
}) {
	return (
		<div className='flex items-start gap-3 py-3'>
			<div className='mt-0.5 text-[#9CA3AF]'>{icon}</div>
			<div className='flex-1 min-w-0'>
				<p className='text-[11px] text-[#6B7280] mb-0.5'>{label}</p>
				<p className='text-sm font-medium text-[#F2F2F2] break-words'>
					{value}
				</p>
			</div>
		</div>
	)
}

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
		<div className='border border-white/8 rounded-[20px] overflow-hidden bg-white/3'>
			{/* header — ФИО всегда видно */}
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
					<p className='text-sm font-semibold text-[#F2F2F2]'>
						{relative.full_name}
					</p>
					<p className='text-xs text-[#9CA3AF]'>{relative.relationship}</p>
				</div>
				{hasDetails && (
					<button
						className='shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 active:bg-white/10 transition-colors'
						onClick={() => setOpen(v => !v)}
					>
						<ChevronDown
							size={16}
							className='text-[#6B7280] transition-transform duration-200'
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
					<div className='px-4 pb-4 border-t border-white/5'>
						{relative.address && (
							<InfoRow
								icon={<Home size={15} />}
								label='Адрес'
								value={relative.address}
							/>
						)}
						{relative.phones.map((p, i) => (
							<div key={i}>
								<Divider />
								<InfoRow
									icon={<Phone size={15} />}
									label={phoneTypeLabel(p.type)}
									value={p.number}
								/>
							</div>
						))}
						{relative.emails.map((e, i) => (
							<div key={i}>
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
			className='bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/8 overflow-hidden'
			style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)' }}
		>
			<div className='flex items-center gap-2 px-5 pt-5 pb-3'>
				<Users size={16} className='text-[#9CA3AF]' />
				<p className='text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider'>
					Родственники
				</p>
				<span className='ml-auto text-xs font-semibold text-[#F2F2F2] bg-white/10 px-2 py-0.5 rounded-full'>
					{relatives.length}
				</span>
			</div>
			<div className='px-4 pb-4 space-y-2'>
				{relatives.map((r, i) => (
					<RelativeItem key={i} relative={r} index={i} />
				))}
			</div>
		</div>
	)
}
