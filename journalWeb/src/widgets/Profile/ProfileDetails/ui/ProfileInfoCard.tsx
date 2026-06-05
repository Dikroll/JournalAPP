import type { ProfileDetails } from '@/entities/profile'
import { formatDate } from '@/shared/utils'
import {
	AtSign,
	Calendar,
	CheckCircle2,
	MapPin,
	Phone,
	XCircle,
} from 'lucide-react'
import { Divider, InfoRow } from './shared/ProfileInfoParts'

export function phoneTypeLabel(type: number): string {
	const map: Record<number, string> = {
		0: 'Мобильный',
		1: 'Домашний',
		2: 'Рабочий',
	}
	return map[type] ?? 'Телефон'
}

function VerifiedBadge({ ok }: { ok: boolean }) {
	return ok ? (
		<CheckCircle2 size={16} className='text-status-checked' />
	) : (
		<XCircle size={16} className='text-status-overdue' />
	)
}

interface Props {
	details: ProfileDetails
	flat?: boolean
}

export function ProfileInfoCard({ details, flat }: Props) {
	return (
		<div
			className={
				flat
					? 'overflow-hidden'
					: 'bg-app-surface backdrop-blur-xl rounded-[24px] border border-app-border overflow-hidden'
			}
			style={flat ? undefined : { boxShadow: 'var(--shadow-card)' }}
		>
			{!flat && (
				<p
					className={`text-xs font-semibold text-app-muted uppercase tracking-wider px-5 pt-5 pb-4`}
				>
					Личные данные
				</p>
			)}
			<div className={`${flat ? '' : 'px-5'} pb-1 flex flex-col`}>
				<div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8'>
					<InfoRow
						icon={<Calendar size={18} strokeWidth={1.5} />}
						label='Дата рождения'
						value={formatDate(details.birthday)}
					/>
					{details.phones.length > 0 && (
						<InfoRow
							icon={<Phone size={18} strokeWidth={1.5} />}
							label={phoneTypeLabel(details.phones[0].type)}
							value={details.phones[0].number}
							badge={<VerifiedBadge ok={details.is_phone_verified} />}
						/>
					)}
				</div>
				<Divider />
				<div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8'>
					<InfoRow
						icon={<AtSign size={18} strokeWidth={1.5} />}
						label='Email'
						value={details.email}
						badge={<VerifiedBadge ok={details.is_email_verified} />}
					/>
					<InfoRow
						icon={<MapPin size={18} strokeWidth={1.5} />}
						label='Адрес'
						value={details.address}
					/>
				</div>
				{details.phones.slice(1).map((p, i) => (
					<div key={p.number}>
						<Divider />
						<div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8'>
							{/* Placeholder for left column */}
							<div className='hidden lg:block' />
							<InfoRow
								icon={<Phone size={18} strokeWidth={1.5} />}
								label={phoneTypeLabel(p.type)}
								value={p.number}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
