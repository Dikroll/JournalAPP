import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { LoginRequest, LoginResponse } from "../model/types"

export const authApi = {
	login: (payload: LoginRequest): Promise<LoginResponse> =>
		api
			.post<LoginResponse>(
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
}