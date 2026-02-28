import { api } from "@/shared/api/instance"

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
			.post<TokenResponse>(
				"/auth/login",
				new URLSearchParams({
					grant_type: "password",
					username: payload.username,
					password: payload.password,
				}),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				},
			)
			.then((r) => r.data),
};