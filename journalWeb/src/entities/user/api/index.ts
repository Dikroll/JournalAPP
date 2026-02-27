import { api } from "@/shared/api/instance";
import type { UserInfo } from "../model/types";

export const userApi = {
	getMe: () => api.get<UserInfo>("/user/me").then((r) => r.data),
};
