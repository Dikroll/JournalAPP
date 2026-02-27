import { api } from "@/shared/api/instance";

interface LoginPayload {
	username: string;
	password: string;
}

interface TokenResponse {
	access_token: string;
	token_type: string;
}

export const authApi = {
	login: (payload: LoginPayload) =>
		api
			.post<TokenResponse>("/auth/login", new URLSearchParams(payload), {
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			})
			.then((r) => r.data),
};
