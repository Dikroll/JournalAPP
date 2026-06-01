class PageConfig {
	// Page routes
	readonly login = "/login";
	readonly home = "/";
	readonly schedule = "/schedule";
	readonly homework = "/homework";
	readonly library = "/library";
	readonly profile = "/profile";
	readonly profileDetails = "/profile/details";
	readonly profileActivity = "/profile/activity";
	readonly grades = "/grades";
	readonly goals = "/goals";
	readonly payment = "/payment";
	readonly market = "/market";
	readonly notifications = "/notifications";
	readonly notificationSettings = "/profile/notification-settings";
	readonly evaluateLesson = "/evaluate-lesson";
	readonly news = "/news";
}

export const pageConfig = new PageConfig();

export const PAGE_TITLES: Record<string, string> = {
	[pageConfig.home]: "Главная",
	[pageConfig.grades]: "Оценки",
	[pageConfig.schedule]: "Расписание",
	[pageConfig.homework]: "Домашние задания",
	[pageConfig.library]: "Библиотека",
	[pageConfig.profile]: "Профиль",
	[pageConfig.profileDetails]: "Детали профиля",
	[pageConfig.profileActivity]: "Изменения баланса",
	[pageConfig.goals]: "Сводка оценок",
	[pageConfig.payment]: "Платежи",
	[pageConfig.market]: "Маркет",
	[pageConfig.notifications]: "Уведомления",
	[pageConfig.notificationSettings]: "Настройки уведомлений",
	[pageConfig.evaluateLesson]: "Оценка занятий",
	[pageConfig.news]: "Новости",
};
