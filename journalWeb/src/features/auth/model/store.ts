import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
	setToken: (token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			isAuthenticated: false,
			setToken: (token) => {
				localStorage.setItem("access_token", token);
				set({ token, isAuthenticated: true });
			},
			logout: () => {
				localStorage.removeItem("access_token");
				set({ token: null, isAuthenticated: false });
			},
		}),
		{ name: "auth-store" },
	),
);
