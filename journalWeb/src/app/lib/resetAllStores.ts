import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'
import { storage } from '@/shared/lib/storage'

export function resetAllStores(): void {
	useHomeworkStore.getState().reset()
	useGradesStore.getState().reset()
	usePaymentStore.getState().reset()

	useUserStore.setState({ user: null })
	useExamStore.setState({
		exams: [],
		status: 'idle',
		loadedAt: null,
		results: [],
		resultsStatus: 'idle',
		resultsLoadedAt: null,
	})
	useSubjectStore.setState({ subjects: [], status: 'idle', loadedAt: null })

	useDashboardChartsStore.setState({
		progress: [],
		attendance: [],
		status: 'idle',
		loadedAt: null,
	})
	useLeaderboardStore.setState({
		group: { data: null, status: 'idle', loadedAt: null },
		stream: { data: null, status: 'idle', loadedAt: null },
	})
	useReviewStore.setState({ reviews: [], status: 'idle', loadedAt: null })
	useScheduleStore.setState({
		today: [],
		todayStatus: 'idle',
		todayLoadedAt: null,
		error: null,
		months: {},
		monthStatus: {},
		monthLoadedAt: {},
	})
	useProfileDetailsStore.setState({ details: null, status: 'idle' })
	;['user-store', 'exam-store', 'subject-store'].forEach(k =>
		localStorage.removeItem(k),
	)
	storage.clear('cache:')
}
