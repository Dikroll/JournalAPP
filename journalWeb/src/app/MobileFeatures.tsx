/**
 * MobileFeatures — компонент, который инициализирует все
 * нативные (Capacitor) фичи: обновления, уведомления, виджеты, сеть.
 *
 * Этот файл импортируется ТОЛЬКО на нативной платформе
 * (через динамический import в App.tsx), поэтому на веб-сборке
 * весь этот код и его зависимости полностью вырезаются из бандла.
 */
import { AppUpdateSheet, useInitAppUpdate } from "@/features/appUpdate";
import { useInitExamReminders } from "@/features/examReminders";
import { useInitGoalsWidget } from "@/features/goalsWidget";
import { useInitScheduleReminders } from "@/features/scheduleReminders";
import { useNetworkInit } from "@/shared/hooks/useNetworkInit";

export default function MobileFeatures() {
	useInitAppUpdate();
	useInitScheduleReminders();
	useInitExamReminders();
	useInitGoalsWidget();
	useNetworkInit();

	return <AppUpdateSheet />;
}
