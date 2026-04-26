import type { ProfileDetails } from '@/entities/profile'
import { formatDate } from '@/shared/utils'
import {
	AtSign,
	Calendar,
	CheckCircle2,
	Home,
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
}

export function ProfileInfoCard({ details }: Props) {
	return (
		<div
			className='bg-app-surface backdrop-blur-xl rounded-[24px] border border-app-border overflow-hidden'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<p className='text-[11px] font-semibold text-app-muted uppercase tracking-wider px-5 pt-5 pb-2'>
				Личные данные
			</p>
			<div className='px-5 pb-1'>
				<InfoRow
					icon={<Calendar size={15} />}
					label='Дата рождения'
					value={formatDate(details.birthday)}
				/>
				<Divider />
				<InfoRow
					icon={<Home size={15} />}
					label='Адрес'
					value={details.address}
				/>
				<Divider />
				<InfoRow
					icon={<AtSign size={15} />}
					label='Email'
					value={details.email}
					badge={<VerifiedBadge ok={details.is_email_verified} />}
				/>
				{details.phones.map((p, i) => (
					<div key={p.number}>
						<Divider />
						<InfoRow
							icon={<Phone size={15} />}
							label={phoneTypeLabel(p.type)}
							value={p.number}
							badge={
								i === 0 ? (
									<VerifiedBadge ok={details.is_phone_verified} />
								) : undefined
							}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
