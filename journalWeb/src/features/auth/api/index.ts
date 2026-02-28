import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"

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
				apiConfig.AUTH_LOGIN,
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