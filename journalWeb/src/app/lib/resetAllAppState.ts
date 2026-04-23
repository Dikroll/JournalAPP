import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { useFeedbackStore } from '@/entities/feedback/model/store'
import { useGoalsStore } from '@/entities/goals'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { useLibraryStore } from '@/entities/library/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import {
	DEFAULT_STATUSES,
	useLessonNotesStore,
} from '@/entities/schedule/model/notesStore'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'
import { resetInitUserFetch } from '@/features/initUser/hooks/useInitUser'
import {
	clearAllQueueFiles,
	useOfflineQueueStore,
} from '@/features/offlineQueue'
import { storage } from '@/shared/lib/storage'
import { useThemeStore } from '@/shared/lib/themeStore'
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

	try {
		useGradesStore.persist.clearStorage?.()
	} catch {}
	useGradesStore.getState().reset()

	try {
		useHomeworkStore.persist.clearStorage?.()
	} catch {}
	useHomeworkStore.getState().reset()

	useLibraryStore.getState().reset()

	try {
		usePaymentStore.persist.clearStorage?.()
	} catch {}
	usePaymentStore.getState().reset()

	try {
		useExamStore.persist.clearStorage?.()
	} catch {}
	useExamStore.setState({
		exams: [],
		status: 'idle',
		loadedAt: null,
		results: [],
		resultsStatus: 'idle',
		resultsLoadedAt: null,
	})

	try {
		useSubjectStore.persist.clearStorage?.()
	} catch {}
	useSubjectStore.setState({
		subjects: [],
		status: 'idle',
		loadedAt: null,
	})

	try {
		useDashboardChartsStore.persist.clearStorage?.()
	} catch {}
	useDashboardChartsStore.setState({
		progress: [],
		attendance: [],
		status: 'idle',
		loadedAt: null,
		activity: [],
		activityStatus: 'idle',
		activityLoadedAt: null,
	})

	try {
		useLeaderboardStore.persist.clearStorage?.()
	} catch {}
	useLeaderboardStore.setState({
		data: null,
		status: 'idle',
		loadedAt: null,
	})

	try {
		useReviewStore.persist.clearStorage?.()
	} catch {}
	useReviewStore.setState({
		reviews: [],
		status: 'idle',
		loadedAt: null,
	})

	try {
		useScheduleStore.persist.clearStorage?.()
	} catch {}
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

	try {
		useOfflineQueueStore.persist.clearStorage?.()
	} catch {}
	useOfflineQueueStore.setState({ items: [] })
	clearAllQueueFiles().catch(() => {})

	try {
		useFeedbackStore.persist.clearStorage?.()
	} catch {}
	useFeedbackStore.setState({
		pending: [],
		pendingStatus: 'idle',
		pendingLoadedAt: null,
		tags: [],
		tagsStatus: 'idle',
		tagsLoadedAt: null,
		error: null,
	})

	try {
		useLessonNotesStore.persist.clearStorage?.()
	} catch {}
	useLessonNotesStore.setState({
		notes: {},
		statuses: DEFAULT_STATUSES,
	})

	try {
		useGoalsStore.persist.clearStorage?.()
	} catch {}
	useGoalsStore.setState({ targets: {} })

	try {
		useProfileDetailsStore.persist.clearStorage?.()
	} catch {}
	useProfileDetailsStore.setState({
		details: null,
		status: 'idle',
	})

	try {
		useUserStore.persist.clearStorage?.()
	} catch {}
	useUserStore.setState({
		user: null,
	})

	if (resetOnboarding) {
		try {
			useOnboardingStore.persist.clearStorage?.()
		} catch {}
		useOnboardingStore.setState({
			isDone: false,
		})
	}

	if (resetTheme) {
		try {
			useThemeStore.persist.clearStorage?.()
		} catch {}
		useThemeStore.setState(state => ({
			...state,
			theme: 'dark',
		}))
	}

	if (resetAuth) {
		try {
			useAuthStore.persist.clearStorage?.()
		} catch {}
		useAuthStore.setState(state => ({
			token: null,
			isAuthenticated: false,
			activeUsername: null,
			accounts: state.accounts.filter(
				account => account.username !== state.activeUsername,
			),
		}))
	}
}
