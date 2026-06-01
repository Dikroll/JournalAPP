import { LogOut } from "lucide-react";
import { BottomSheet, SheetButton } from "@/shared/ui";

interface Props {
	onConfirm: () => void;
	onCancel: () => void;
}

export function LogoutConfirm({ onConfirm, onCancel }: Props) {
	return (
		<BottomSheet onBackdropClick={onCancel} maxWidth="max-w-sm">
			<div className="space-y-3">
				<div className="flex items-center gap-3 mb-1">
					<div className="w-10 h-10 rounded-full bg-glass border border-glass-border flex items-center justify-center">
						<LogOut size={18} className="text-app-muted" />
					</div>
					<div>
						<p className="text-sm font-semibold text-app-text">
							Выйти из аккаунта?
						</p>
						<p className="text-xs text-app-muted mt-0.5">
							Аккаунт будет удалён из списка
						</p>
					</div>
				</div>
				<SheetButton variant="danger" onClick={onConfirm}>
					Выйти
				</SheetButton>
				<SheetButton onClick={onCancel}>Отмена</SheetButton>
			</div>
		</BottomSheet>
	);
}
