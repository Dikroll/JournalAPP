/**
 * Unified function to reset ALL application state
 * Called on:
 * 1. User logout (clears auth)
 * 2. Login with new user (clears previous user's state)
 */

// === ENTITIES ===
import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { useLibraryStore } from '@/entities/library/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'

// === SHARED ===
import { storage } from '@/shared/lib/storage'
import { useThemeStore } from '@/shared/lib/themeStore'
import { useAuthStore } from '@/shared/model/authStore'
import { useOnboardingStore } from '@/shared/model/onboardingStore'

interface ResetOptions {
	/** If true, also resets auth store (logout). If false, keeps auth (new login) */
	resetAuth?: boolean
	/** If true, resets theme to dark. Defaults to true */
	resetTheme?: boolean
	/** If true, resets onboarding state. Defaults to true */
	resetOnboarding?: boolean
}

/**
 * Comprehensive state reset for all stores
 * Used on logout and new login to clear previous user's cached data
 *
 * ⚠️ IMPORTANT: Also clears localStorage for persisted stores
 * to prevent old data from being re-hydrated on component mount
 */
export function resetAllAppState(options: ResetOptions = {}) {
	const {
		resetAuth = true,
		resetTheme = true,
		resetOnboarding = true,
	} = options

	// ========================================
	// CLEAR STORAGE CACHE FIRST
	// ========================================
	// Hooks load cached data from storage on mount.
	// If we don't clear it, old user data will be used until new data arrives.
	// Must happen BEFORE resetting stores.
	storage.clear('cache:')

	// ========================================
	// ENTITY STORES - Clear all cached data
	// ========================================

	// For stores with reset() method, use it (properly handles all fields)
	useGradesStore.getState().reset()
	useHomeworkStore.getState().reset()
	useLibraryStore.getState().reset()
	usePaymentStore.getState().reset()

	// For persisted stores with custom fields, must use both:
	// 1. Clear persist storage to prevent re-hydration
	// 2. Clear in-memory state

	// Exam store (persisted with partialize)
	try {
		useExamStore.persist.clearStorage?.()
	} catch {
		// Fallback if clearStorage not available
	}
	useExamStore.setState({
		exams: [],
		status: 'idle',
		loadedAt: null,
		results: [],
		resultsStatus: 'idle',
		resultsLoadedAt: null,
	})

	// Subject store (persisted with partialize)
	try {
		useSubjectStore.persist.clearStorage?.()
	} catch {
		// Fallback if clearStorage not available
	}
	useSubjectStore.setState({
		subjects: [],
		status: 'idle',
		loadedAt: null,
	})

	// Dashboard charts (non-persisted)
	useDashboardChartsStore.setState({
		progress: [],
		attendance: [],
		status: 'idle',
		loadedAt: null,
	})

	// Leaderboard (non-persisted)
	useLeaderboardStore.setState({
		group: { data: null, status: 'idle', loadedAt: null },
		stream: { data: null, status: 'idle', loadedAt: null },
	})

	// Review store (non-persisted)
	useReviewStore.setState({
		reviews: [],
		status: 'idle',
		loadedAt: null,
	})

	// Schedule store (non-persisted)
	useScheduleStore.setState({
		months: {},
		monthStatus: {},
		monthLoadedAt: {},
		today: [],
		todayStatus: 'idle',
		todayLoadedAt: null,
		error: null,
	})

	// Profile details (non-persisted)
	useProfileDetailsStore.setState({
		details: null,
		status: 'idle',
	})

	// User store (persisted)
	try {
		useUserStore.persist.clearStorage?.()
	} catch {
		// Fallback if clearStorage not available
	}
	useUserStore.setState({
		user: null,
	})

	// ========================================
	// SHARED FEATURE STATES
	// ========================================

	if (resetOnboarding) {
		try {
			useOnboardingStore.persist.clearStorage?.()
		} catch {
			// Fallback if clearStorage not available
		}
		useOnboardingStore.setState({
			isDone: false,
		})
	}

	// ========================================
	// SHARED CONFIG STATES
	// ========================================

	if (resetTheme) {
		try {
			useThemeStore.persist.clearStorage?.()
		} catch {
			// Fallback if clearStorage not available
		}
		useThemeStore.setState(state => ({
			...state,
			theme: 'dark',
		}))
	}

	// ========================================
	// AUTH STATE
	// ========================================
	// Only reset auth on explicit logout, not on new login
	if (resetAuth) {
		try {
			useAuthStore.persist.clearStorage?.()
		} catch {
			// Fallback if clearStorage not available
		}
		useAuthStore.setState(state => ({
			token: null,
			isAuthenticated: false,
			activeUsername: null,
			accounts: state.accounts.filter(a => a.username !== state.activeUsername),
		}))
	}
}
