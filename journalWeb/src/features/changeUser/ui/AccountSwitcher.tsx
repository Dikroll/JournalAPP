import { LogOut, Plus } from "lucide-react";
import { BottomSheet } from "@/shared/ui";
import { useAccountSwitcher } from "../hooks/useAccountSwitcher";
import { AccountRow } from "./AccountRow";
import { LogoutConfirm } from "./LogoutConfirm";

interface Props {
	onClose: () => void;
	onAddAccount: () => void;
	onReset: () => void;
}

export function AccountSwitcher({ onClose, onAddAccount, onReset }: Props) {
	const {
		accounts,
		activeUsername,
		switchingTo,
		confirmLogout,
		setConfirmLogout,
		handleSwitch,
		handleRemove,
		handleLogout,
	} = useAccountSwitcher(onReset, onClose);

	if (confirmLogout) {
		return (
			<LogoutConfirm
				onConfirm={handleLogout}
				onCancel={() => setConfirmLogout(false)}
			/>
		);
	}

	return (
		<BottomSheet onBackdropClick={onClose} maxWidth="max-w-lg">
			<div className="space-y-3">
				<p className="text-sm font-semibold text-app-text mb-3">Аккаунты</p>

				<div className="space-y-2">
					{accounts.map((account) => (
						<AccountRow
							key={account.username}
							account={account}
							isActive={account.username === activeUsername}
							isSwitching={switchingTo === account.username}
							onSwitch={() => handleSwitch(account.username)}
							onRemove={() => handleRemove(account.username)}
						/>
					))}
				</div>

				{accounts.length < 5 && (
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							onClose();
							onAddAccount();
						}}
						className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-glass border border-glass-border text-app-muted text-sm hover:bg-glass-hover"
					>
						<Plus size={15} />
						Добавить аккаунт
					</button>
				)}

				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						setConfirmLogout(true);
					}}
					className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-danger-subtle border border-danger-border text-danger text-sm font-medium hover:bg-danger-subtle"
				>
					<LogOut size={15} />
					Выйти из аккаунта
				</button>
			</div>
		</BottomSheet>
	);
}
