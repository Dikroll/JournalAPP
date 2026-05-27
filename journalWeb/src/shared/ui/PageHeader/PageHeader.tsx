import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "../IconButton/IconButton";

interface Props {
	title: string;
	actions?: ReactNode;
	showBack?: boolean;
}

export function PageHeader({ title, actions, showBack }: Props) {
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				{showBack && (
					<IconButton
						icon={<ArrowLeft size={18} />}
						onClick={() => navigate(-1)}
						size="md"
						shape="square"
						variant="surface"
						aria-label="Назад"
					/>
				)}
				<h1 className="text-2xl font-bold text-app-text">{title}</h1>
			</div>
			{actions && <div className="flex items-center gap-2">{actions}</div>}
		</div>
	);
}
