import type { DashboardActivityEntry, OperationType } from "../model/types";

export type ActivityFilter = "ALL" | "COIN" | "DIAMOND";

export interface ActivityViewItem {
	key: string;
	dateLabel: string;
	dateGroupKey: string;
	dateGroupLabel: string;
	timeLabel: string;
	title: string;
	points: number;
	pointsLabel: string;
	pointType: string;
	pointTypeLabel: string;
	accentColor: string;
	accentBorder: string;
	isSpend: boolean;
}

const ACHIEVEMENT_LABELS: Record<string, string> = {
	PAIR_VISIT: "Посещение пары",
	EVALUATION_LESSON_MARK: "Оценка занятия",
	HOMETASK_INTIME: "Домашнее задание сдано вовремя",
	HOMEWORK_INTIME: "Домашнее задание сдано вовремя",
	ASSESSMENT: "Оценка",
	ASSESMENT: "Оценка",
	MARKET_ORDER: "Покупка в магазине",
	WORK_IN_CLASS: "Работа в классе",
	SURVEY: "Опрос",
	AUTO_MARK_EXPIRED_HOMEWORK: "Просроченное домашнее задание",
	REDO_HOMETASK: "Пересдача домашнего задания",
	REDO_LABORATORY_WORK: "Пересдача лабораторной работы",
	INTIME_LABORATORY_WORK: "Лабораторная работа сдана вовремя",
	QUIZ_PASSING_EXPIRATION: "Просроченный тест",
	PASSED_QUIZ: "Тест пройден",
	"20_VISITS_WITHOUT_GAP": "20 посещений без пропусков",
	"20_VISITS_WITHOUT_DELAY": "20 посещений без опозданий",
	"10_VISITS_WITHOUT_GAP": "10 посещений без пропусков",
	"10_VISITS_WITHOUT_DELAY": "10 посещений без опозданий",
	"5_VISITS_WITHOUT_GAP": "5 посещений без пропусков",
	"5_VISITS_WITHOUT_DELAY": "5 посещений без опозданий",
	FILL_IN_PROFILE: "Заполнение профиля",
};

/**
 * Achievements that represent spending/deducting resources
 */
const SPEND_ACHIEVEMENTS = new Set([
	"MARKET_ORDER",
	"AUTO_MARK_EXPIRED_HOMEWORK",
	"REDO_HOMETASK",
	"REDO_LABORATORY_WORK",
	"QUIZ_PASSING_EXPIRATION",
]);

/**
 * Determine operation type based on achievement name
 * @param achievement - Achievement/operation name
 * @param operationType - Explicit operation type from API (takes precedence)
 */
export function getOperationType(
	achievement: string,
	operationType?: OperationType,
): OperationType {
	// API-provided type takes precedence
	if (operationType) return operationType;
	// Determine based on achievement name
	return SPEND_ACHIEVEMENTS.has(achievement) ? "spend" : "earn";
}

const ACHIEVEMENT_WORDS: Record<string, string> = {
	HOMETASK: "Домашнее задание",
	HOMEWORK: "Домашнее задание",
	INTIME: "вовремя",
	IN: "в",
	TIME: "срок",
	ASSESSMENT: "Оценка",
	ASSESMENT: "Оценка",
	EVALUATION: "Оценивание",
	LESSON: "занятие",
	MARK: "оценка",
	PAIR: "пара",
	VISIT: "посещение",
	SURVEY: "Опрос",
};

export function resolveActivityFilter(value?: string | null): ActivityFilter {
	return value === "COIN" || value === "DIAMOND" ? value : "ALL";
}

export function filterActivityEntries(
	entries: DashboardActivityEntry[],
	filter: ActivityFilter,
) {
	if (filter === "ALL") return entries;
	return entries.filter((entry) => entry.point_type === filter);
}

export function buildActivityViewItems(entries: DashboardActivityEntry[]) {
	return entries.map<ActivityViewItem>((entry, index) => {
		const operationType = getOperationType(
			entry.achievement,
			entry.operation_type,
		);
		const isSpend = operationType === "spend";

		const accentColor =
			entry.point_type === "COIN"
				? "rgba(0,217,255,0.16)"
				: entry.point_type === "DIAMOND"
					? "rgba(255,215,0,0.18)"
					: "rgba(34,197,94,0.14)";
		const accentBorder =
			entry.point_type === "COIN"
				? "rgba(0,217,255,0.28)"
				: entry.point_type === "DIAMOND"
					? "rgba(255,215,0,0.32)"
					: "rgba(34,197,94,0.24)";

		const pointsPrefix = isSpend ? "−" : "+";
		const dateInfo = formatActivityDateParts(entry.date);

		return {
			key: `${entry.date}-${entry.achievement}-${entry.point_type}-${entry.points}-${index}`,
			dateLabel: dateInfo.full,
			dateGroupKey: dateInfo.groupKey,
			dateGroupLabel: dateInfo.group,
			timeLabel: dateInfo.time,
			title: getAchievementLabel(entry.achievement),
			points: entry.points,
			pointsLabel: `${pointsPrefix}${entry.points.toLocaleString("ru-RU")}`,
			pointType: entry.point_type,
			pointTypeLabel: getPointTypeLabel(entry.point_type),
			accentColor,
			accentBorder,
			isSpend,
		};
	});
}

function normalizeActivityDate(raw: string) {
	const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;
	const date = new Date(normalized);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatActivityDateParts(raw: string) {
	const date = normalizeActivityDate(raw);

	if (!date) {
		return {
			full: raw,
			groupKey: raw,
			group: raw,
			time: "",
		};
	}

	return {
		full: date.toLocaleString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}),
		groupKey: date.toISOString().split("T")[0],
		group: date.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}),
		time: date.toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit",
		}),
	};
}

function getAchievementLabel(achievement: string) {
	if (ACHIEVEMENT_LABELS[achievement]) {
		return ACHIEVEMENT_LABELS[achievement];
	}

	return achievement
		.split("_")
		.filter(Boolean)
		.map(
			(word) =>
				ACHIEVEMENT_WORDS[word] ?? word[0] + word.slice(1).toLowerCase(),
		)
		.join(" ");
}

function getPointTypeLabel(pointType: string) {
	switch (pointType) {
		case "COIN":
			return "Топгемы";
		case "DIAMOND":
			return "Топмани";
		default:
			return "Баллы";
	}
}
