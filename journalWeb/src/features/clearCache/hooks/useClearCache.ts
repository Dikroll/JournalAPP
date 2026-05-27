import { resetAllAppState } from '@/shared/lib/resetAllAppState'

export function clearCache(): void {
	resetAllAppState({
		resetAuth: false,
		resetTheme: false,
		resetOnboarding: false,
	})
}

export function useClearCache() {
	return clearCache
}
