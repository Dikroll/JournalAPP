import { create } from "zustand";
import { persistEncrypted } from "@/shared/lib/zustandEncryptedPersist";
import type { NewsState } from "./types";

export const useNewsStore = create<NewsState>()(
	persistEncrypted(
		(set) => ({
			latest: [],
			details: {},
			status: "idle",
			error: null,
			loadedAt: null,

			update: (patch) => set(patch),

			setDetail: (id, detail) =>
				set((state) => ({
					details: {
						...state.details,
						[id]: detail,
					},
				})),

			markAsRead: (id) =>
				set((state) => ({
					latest: state.latest.map((item) =>
						item.id === id ? { ...item, is_read: true } : item,
					),
					details: state.details[id]
						? {
								...state.details,
								[id]: { ...state.details[id], is_read: true },
							}
						: state.details,
				})),

			reset: () =>
				set({
					latest: [],
					details: {},
					status: "idle",
					error: null,
					loadedAt: null,
				}),
		}),
		{
			name: "news-store",
			version: 1,
			partialize: (state) => ({
				latest: state.latest,
				details: state.details,
				loadedAt: state.loadedAt,
			}),
		},
	),
);
