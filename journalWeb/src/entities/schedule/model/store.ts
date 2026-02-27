import type { LoadingState } from "@/shared/types";
import { create } from "zustand";
import type { LessonItem } from "./types";

interface ScheduleState {
	today: LessonItem[];
	status: LoadingState;
	error: string | null;
	setToday: (lessons: LessonItem[]) => void;
	setStatus: (s: LoadingState) => void;
	setError: (e: string | null) => void;
}

export const useScheduleStore = create<ScheduleState>()((set) => ({
	today: [],
	status: "idle",
	error: null,
	setToday: (today) => set({ today }),
	setStatus: (status) => set({ status }),
	setError: (error) => set({ error }),
}));
