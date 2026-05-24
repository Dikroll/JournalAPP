import { Coins, Diamond } from 'lucide-react'

export function ActivityIntroCard() {
	return (
		<div
			className='rounded-[28px] p-5 border border-app-border relative overflow-hidden'
			style={{
				boxShadow: 'var(--shadow-card)',
				background:
					'radial-gradient(circle at top right, rgba(255,215,0,0.14), transparent 34%), radial-gradient(circle at bottom left, rgba(0,217,255,0.12), transparent 38%), var(--color-surface)',
			}}
		>
			<div className='absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#FFD700]/10 blur-2xl pointer-events-none' />
			<div className='absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#00D9FF]/10 blur-2xl pointer-events-none' />

			<div className='relative flex items-start justify-between gap-4'>
				<div>
					<p className='text-sm font-semibold text-app-text'>
						История начислений
					</p>
					<p className='text-xs text-app-muted mt-1 max-w-[18rem]'>
						Здесь собраны все последние начисления топмани и топгемов.
					</p>
				</div>

				<div className='flex items-center gap-2 shrink-0'>
					<div className='w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center'>
						<Coins size={18} className='text-[#FFD700]' />
					</div>
					<div className='w-10 h-10 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center'>
						<Diamond size={18} className='text-[#00D9FF]' />
					</div>
				</div>
			</div>
		</div>
	)
}
