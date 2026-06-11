import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi, useUserStore } from "@/entities/user";
import { pageConfig } from "@/shared/config";
import { fixUrl } from "@/shared/lib/imageCache";
import { useAuthStore } from "@/shared/model/authStore";

export function useSwitchUser(onReset: () => void) {
	const [switching, setSwitching] = useState(false);
	const switchAccount = useAuthStore((s) => s.switchAccount);
	const saveAccount = useAuthStore((s) => s.saveAccount);
	const removeAccount = useAuthStore((s) => s.removeAccount);
	const setUser = useUserStore((s) => s.setUser);
	const navigate = useNavigate();

	const switchTo = useCallback(
		async (username: string) => {
			setSwitching(true);
			try {
				onReset();

				const success = switchAccount(username);
				if (!success) return;

				try {
					const userData = await userApi.getMe();
					setUser(userData);
					saveAccount({
						username,
						token: useAuthStore.getState().token!,
						fullName: userData.full_name,
						groupName: userData.group.name,
						avatarUrl: fixUrl(userData.photo_url),
					});
				} catch (err: unknown) {
					// If token is expired/revoked, remove the stale account
					const status = (err as { response?: { status?: number } })?.response
						?.status;
					if (status === 401) {
						removeAccount(username);
						navigate(pageConfig.login, { replace: true });
						return;
					}
					// For other errors (network, etc.) — still navigate to home,
					// the initUser flow will retry fetching user data
				}

				navigate(pageConfig.home, { replace: true });
			} finally {
				setSwitching(false);
			}
		},
		[onReset, switchAccount, saveAccount, removeAccount, setUser, navigate],
	);

	return { switchTo, switching };
}
