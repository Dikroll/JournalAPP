import { resetAllAppState } from '@/shared/lib'

export function clearCache(): void {
	// Clear all cached data but keep auth state
	// (user is still logged in, just wants to refresh)
	resetAllAppState({
		resetAuth: false,
		resetTheme: false, // Keep theme preference
		resetOnboarding: false,
	})
}

export function useClearCache() {
	return clearCache
}
