/**
 * Example: Dashboard Store with Encryption
 *
 * Shows the step-by-step migration from unencrypted to encrypted storage
 *
 * BEFORE: Uses zustand/middleware persist (unencrypted)
 * AFTER: Uses persistEncrypted from zustandEncryptedPersist (encrypted)
 */

import { create } from "zustand";
import { persistEncrypted } from "@/shared/lib/zustandEncryptedPersist";
import type { LoadingState } from "@/shared/types";

interface ChartPoint {
	x: number;
	y: number;
}

interface DashboardActivityEntry {
	id: string;
	timestamp: number;
}

interface DashboardChartsState {
	progress: ChartPoint[];
	attendance: ChartPoint[];
	status: LoadingState;
	loadedAt: number | null;
	activity: DashboardActivityEntry[];
	activityStatus: LoadingState;
	activityLoadedAt: number | null;
	setProgress: (data: ChartPoint[]) => void;
	setAttendance: (data: ChartPoint[]) => void;
	setStatus: (s: LoadingState) => void;
	setLoadedAt: (t: number) => void;
	setActivity: (data: DashboardActivityEntry[]) => void;
	setActivityStatus: (s: LoadingState) => void;
	setActivityLoadedAt: (t: number) => void;
}

/**
 * MIGRATION STEPS:
 * 1. Change import from 'zustand/middleware' to '@/shared/lib/zustandEncryptedPersist'
 * 2. Change 'persist' to 'persistEncrypted'
 * 3. Keep everything else the same!
 */
export const useDashboardChartsStore = create<DashboardChartsState>()(
	persistEncrypted(
		(set: any) => ({
			progress: [],
			attendance: [],
			status: "idle" as LoadingState,
			loadedAt: null,
			activity: [],
			activityStatus: "idle" as LoadingState,
			activityLoadedAt: null,
			setProgress: (progress: ChartPoint[]) => set({ progress }),
			setAttendance: (attendance: ChartPoint[]) => set({ attendance }),
			setStatus: (status: LoadingState) => set({ status }),
			setLoadedAt: (loadedAt: number) => set({ loadedAt }),
			setActivity: (activity: DashboardActivityEntry[]) => set({ activity }),
			setActivityStatus: (activityStatus: LoadingState) =>
				set({ activityStatus }),
			setActivityLoadedAt: (activityLoadedAt: number) =>
				set({ activityLoadedAt }),
		}),
		{
			name: "dashboard-store",
			partialize: (state: DashboardChartsState) => ({
				progress: state.progress,
				attendance: state.attendance,
				loadedAt: state.loadedAt,
				activity: state.activity,
				activityLoadedAt: state.activityLoadedAt,
			}),
		},
	) as any,
);
