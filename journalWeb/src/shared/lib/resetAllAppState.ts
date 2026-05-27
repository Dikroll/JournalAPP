import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { useFeedbackStore } from '@/entities/feedback/model/store'
import { useGoalsStore } from '@/entities/goals'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { useLibraryStore } from '@/entities/library/model/store'
import { useMarketStore } from '@/entities/market/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import { resetScheduleTodayFetch } from '@/entities/schedule/hooks/useScheduleToday'
import {
	DEFAULT_STATUSES,
	useLessonNotesStore,
} from '@/entities/schedule/model/notesStore'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useNewsStore } from '@/entities/news'
import { useUserStore } from '@/entities/user/model/store'
import { clearGoalsWidget } from '@/features/goalsWidget'
import { resetInitUserFetch } from '@/features/initUser/hooks/useInitUser'
import {
	clearAllQueueFiles,
	useOfflineQueueStore,
} from '@/features/offlineQueue'
import { clearScheduleReminders } from '@/features/scheduleReminders/lib/mobileReminders'
import { clearScheduleWidgets } from '@/features/scheduleWidgets'
import { storage } from '@/shared/lib/encryptedStorage'
import { useThemeStore } from '@/shared/lib/themeStore'
import { clearPersistedStoreData } from '@/shared/lib/zustandEncryptedPersist'
import { useAuthStore } from '@/shared/model/authStore'
import { useOnboardingStore } from '@/shared/model/onboardingStore'

interface ResetOptions {
	resetAuth?: boolean
	resetTheme?: boolean
	resetOnboarding?: boolean
}

export function resetAllAppState(options: ResetOptions = {}) {
	const {
		resetAuth = true,
		resetTheme = true,
		resetOnboarding = true,
	} = options

	storage.clear('cache:')
	resetInitUserFetch()
	resetScheduleTodayFetch()
	clearScheduleReminders().catch(() => {})
	clearScheduleWidgets().catch(() => {})
	clearGoalsWidget().catch(() => {})

	// Clear persisted store data
	clearPersistedStoreData('grades-store')
	clearPersistedStoreData('homework-store')
	clearPersistedStoreData('market-store')
	clearPersistedStoreData('payment-store')
	clearPersistedStoreData('exam-store')
	clearPersistedStoreData('subject-store')
	clearPersistedStoreData('dashboard-store')
	clearPersistedStoreData('leaderboard-store')
	clearPersistedStoreData('review-store')
	clearPersistedStoreData('schedule-store')
	clearPersistedStoreData('offline-queue-store')
	clearPersistedStoreData('feedback-store')
	clearPersistedStoreData('notes-store')
	clearPersistedStoreData('goals-store')
	clearPersistedStoreData('profile-details-store')
	clearPersistedStoreData('user-store')
	clearPersistedStoreData('news-store')
	if (resetOnboarding) {
		clearPersistedStoreData('onboarding-store')
	}

	// Reset state
	useGradesStore.getState().reset?.()
	useHomeworkStore.getState().reset?.()
	useLibraryStore.getState().reset?.()
	useMarketStore.getState().reset?.()
	usePaymentStore.getState().reset?.()
	useNewsStore.getState().reset?.()
	useExamStore.setState({
		exams: [],
		status: 'idle',
		loadedAt: null,
		results: [],
		resultsStatus: 'idle',
		resultsLoadedAt: null,
	})

	useSubjectStore.setState({
		subjects: [],
		status: 'idle',
		loadedAt: null,
	})

	useDashboardChartsStore.setState({
		progress: [],
		attendance: [],
		status: 'idle',
		loadedAt: null,
		activity: [],
		activityStatus: 'idle',
		activityLoadedAt: null,
	})

	useLeaderboardStore.setState({
		data: null,
		status: 'idle',
		loadedAt: null,
	})

	useReviewStore.setState({
		reviews: [],
		status: 'idle',
		loadedAt: null,
	})

	useScheduleStore.setState({
		days: {},
		dayStatus: {},
		dayLoadedAt: {},
		months: {},
		monthStatus: {},
		monthLoadedAt: {},
		weeks: {},
		weekStatus: {},
		weekLoadedAt: {},
		today: [],
		todayStatus: 'idle',
		todayLoadedAt: null,
		error: null,
	})

	useOfflineQueueStore.setState({ items: [] })
	clearAllQueueFiles().catch(() => {})

	useFeedbackStore.setState({
		pending: [],
		pendingStatus: 'idle',
		pendingLoadedAt: null,
		tags: [],
		tagsStatus: 'idle',
		tagsLoadedAt: null,
		error: null,
	})

	useLessonNotesStore.setState({
		notes: {},
		statuses: DEFAULT_STATUSES,
	})

	useGoalsStore.getState().reset?.()

	useProfileDetailsStore.setState({
		details: null,
		status: 'idle',
	})

	useUserStore.setState({
		user: null,
	})

	if (resetTheme) {
		useThemeStore.setState(state => ({
			...state,
			theme: 'dark',
		}))
	}

	if (resetAuth) {
		useAuthStore.setState(state => ({
			token: null,
			isAuthenticated: false,
			activeUsername: null,
			accounts: state.accounts.filter(
				account => account.username !== state.activeUsername,
			),
		}))
	}

	if (resetOnboarding) {
		useOnboardingStore.setState({
			isDone: false,
		})
	}
}
