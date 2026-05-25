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
