import { Clock, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardActivityViewModel } from "@/entities/dashboard";
import { pageConfig } from "@/shared/config";

export function DesktopActivityPreview() {
    const model = useDashboardActivityViewModel();
    const navigate = useNavigate();

    if (model.status === "loading") {
        return (
            <div className="bg-app-surface rounded-[24px] border border-app-border p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="h-6 w-48 bg-app-border animate-pulse rounded" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-app-border animate-pulse rounded" />
                ))}
            </div>
        );
    }

    if (model.status === "error" || model.viewItems.length === 0) return null;

    const displayItems = model.viewItems.slice(0, 3);

    return (
        <div className="bg-app-surface rounded-[24px] border border-app-border p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-app-text text-base font-semibold flex items-center gap-2">
                    <Clock size={18} className="text-app-muted" />
                    История операций
                </h3>
                <button 
                    onClick={() => navigate(pageConfig.profileActivity)}
                    className="text-sm text-app-muted hover:text-app-text transition-colors"
                >
                    Вся история
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {displayItems.map((item, index) => {
                    const parts = item.dateLabel.split(/(?:, | в )/);
                    const datePart = parts[0];
                    const timePart = parts[1] || '';
                    
                    return (
                        <div key={item.key}>
                            {index > 0 && <div className="h-px bg-app-border mb-4" />}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                        style={{ 
                                            background: item.isSpend ? 'var(--color-absent-subtle)' : 'var(--color-checked-subtle)',
                                            color: item.isSpend ? 'var(--color-absent)' : 'var(--color-checked)'
                                        }}
                                    >
                                        {item.isSpend ? <Minus size={16} /> : <Plus size={16} />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-semibold text-app-text truncate">
                                            {item.isSpend ? item.title : `Начисление ${item.pointTypeLabel.toLowerCase()}`}
                                        </span>
                                        <span className="text-xs text-app-muted truncate">
                                            {item.isSpend ? item.pointTypeLabel : item.title}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0 text-right">
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${item.isSpend ? 'text-status-absent' : 'text-status-checked'}`}>
                                            {item.pointsLabel}
                                        </span>
                                        <span className="text-[11px] text-app-muted">{item.pointTypeLabel}</span>
                                    </div>
                                    <div className="flex flex-col items-end text-[11px] text-app-muted w-[88px]">
                                        <span>{datePart || item.dateLabel}</span>
                                        {timePart && <span>{timePart}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
