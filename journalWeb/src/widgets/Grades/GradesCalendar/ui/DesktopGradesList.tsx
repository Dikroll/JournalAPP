import {
	GRADE_TYPE_CONFIG,
	getGradeStyle,
	type GradeEntryExpanded,
} from "@/entities/grades";

interface Props {
	entries: GradeEntryExpanded[];
}

export function DesktopGradesList({ entries }: Props) {
	return (
		<div className="bg-app-surface border border-app-border rounded-xl overflow-hidden">
			<div
				className="grid gap-4 px-4 py-2 text-[13px] font-medium text-app-muted border-b border-app-border bg-app-surface-strong"
				style={{ gridTemplateColumns: "30px 1fr 100px 120px" }}
			>
				<div>№</div>
				<div>Предмет</div>
				<div>Посещение</div>
				<div>Оценки</div>
			</div>
			{entries.map((entry, idx) => {
				let attendanceText = "—";
				let attendanceColor = "var(--color-text-muted)";
				if (entry.attended === "present") {
					attendanceText = "Посетил";
					attendanceColor = "#10B981";
				}
				if (entry.attended === "late") {
					attendanceText = "Опоздание";
					attendanceColor = "#F59E0B";
				}
				if (entry.attended === "absent") {
					attendanceText = "Не посетил";
					attendanceColor = "#EF4444";
				}

				return (
					<div
						key={idx}
						className="grid gap-4 px-4 py-3 border-b border-app-border last:border-0 items-center text-[13px]"
						style={{ gridTemplateColumns: "30px 1fr 100px 120px" }}
					>
						<div className="text-app-muted font-medium">
							{entry.lesson_number}
						</div>
						<div className="min-w-0 pr-4">
							<div className="text-app-text font-medium truncate">
								{entry.spec_name}
							</div>
							{entry.teacher && (
								<div className="text-[11px] text-app-muted truncate mt-0.5">
									{entry.teacher}
								</div>
							)}
						</div>
						<div style={{ color: attendanceColor }} className="font-medium">
							{attendanceText}
						</div>
						<div>
							{entry.flatMarks.length > 0 ? (
								<div className="flex flex-wrap gap-1.5">
									{entry.flatMarks.map((m, i) => (
										<div
											key={i}
											className="flex items-center gap-1.5 bg-app-surface-strong border border-app-border rounded px-1.5 py-1"
										>
											<span
												className="text-[10px] text-app-muted rounded"
												style={GRADE_TYPE_CONFIG[m.type]?.style}
											>
												{GRADE_TYPE_CONFIG[m.type]?.label || m.type}
											</span>
											<div
												className="w-5 h-5 rounded-[4px] flex items-center justify-center font-bold text-[11px] text-white"
												style={getGradeStyle(m.value)}
											>
												{m.value}
											</div>
										</div>
									))}
								</div>
							) : (
								<span className="text-app-muted">—</span>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
