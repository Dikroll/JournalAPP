import { create } from "zustand";
import type { SortKey } from "@/entities/grades";

interface SortSubjectsState {
	sortKey: SortKey;
	setSortKey: (key: SortKey) => void;
}

export const useSortSubjectsStore = create<SortSubjectsState>()((set) => ({
	sortKey: "alpha",
	setSortKey: (sortKey) => set({ sortKey }),
}));
