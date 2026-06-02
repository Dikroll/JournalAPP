import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { DashboardCharts } from '@/widgets/DashboardCharts/ui/DashboardCharts'
import { FutureExams } from '@/widgets/FutureExams/ui/FutureExams'
import { HomeScheduleSection } from '@/widgets/Schedule/HomeScheduleSection/ui/HomeScheduleSection'
import { GraduationCap } from 'lucide-react'
import { WebHomePage } from './WebHomePage'

export function HomePage() {
	const isDesktop = useIsDesktop()

	if (isDesktop) return <WebHomePage />

	return (
		<div className='min-h-screen pb-28'>
			<div className='px-4 pt-2 pb-4'>
				<DashboardCharts />

				<HomeScheduleSection />

				<div className='mt-4 mb-3 flex items-center '>
					<div className='w-[2px] self-stretch bg-app-border mr-3 rounded-full' />
					<h1 className='text-[16px] font-bold leading-tight text-app-text flex items-center gap-2'>
						<GraduationCap size={16} className='text-app-muted shrink-0' />
						<span>Будущие экзамены</span>
					</h1>
				</div>

				<FutureExams />
			</div>
		</div>
	)
}
