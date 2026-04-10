import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppReleaseInfo } from '@/shared/lib/appRelease'

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'error'

interface AppUpdateState {
	status: UpdateStatus
	serverInfo: AppReleaseInfo | null
	latestRelease: AppReleaseInfo | null
	downloadProgress: number
	errorMessage: string | null

	setStatus: (s: UpdateStatus) => void
	setServerInfo: (info: AppReleaseInfo) => void
	setLatestRelease: (info: AppReleaseInfo) => void
	setProgress: (p: number) => void
	setError: (msg: string) => void
	reset: () => void
	openSheet: () => void
}

export const useAppUpdateStore = create<AppUpdateState>()(
	persist(
		set => ({
			status: 'idle',
			serverInfo: null,
			latestRelease: null,
			downloadProgress: 0,
			errorMessage: null,

			setStatus: status => set({ status }),
			setServerInfo: serverInfo => set({ serverInfo }),
			setLatestRelease: latestRelease => set({ latestRelease }),
			setProgress: downloadProgress => set({ downloadProgress }),
			setError: errorMessage => set({ errorMessage, status: 'error' }),
			reset: () =>
				set({
					status: 'idle',
					downloadProgress: 0,
					errorMessage: null,
				}),
			openSheet: () =>
				set(state => {
					if (state.serverInfo) return { status: 'available' }
					return {}
				}),
		}),
		{
			name: 'app-update-store',
			partialize: state => ({ latestRelease: state.latestRelease }),
		},
	),
)
