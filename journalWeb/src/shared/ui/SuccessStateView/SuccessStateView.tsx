import { CheckCircle } from 'lucide-react'

interface Props {
	title: string
	subtitle?: string
}

export function SuccessStateView({ title, subtitle }: Props) {
	return (
		<div className='flex flex-col items-center py-6 gap-3'>
			<div className='w-14 h-14 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center'>
				<CheckCircle size={26} className='text-[#10B981]' />
			</div>
			<p className='text-sm font-semibold text-[#F2F2F2]'>{title}</p>
			{subtitle && (
				<p className='text-xs text-[#9CA3AF] text-center'>{subtitle}</p>
			)}
		</div>
	)
}
